import { createHash } from 'node:crypto'

import { z } from 'zod'

import { buildBlogNarrationScript, splitNarrationScript } from '@/lib/blog-narration'
import { generateNarrationAudio } from '@/lib/blog-narration-audio'
import {
  blogNarrationChunkLimit,
  resolveBlogNarrationConfiguration,
} from '@/lib/blog-narration-config'
import {
  ensureDraftSanityPost,
  findSanityPostById,
  patchNarration,
  uploadNarrationAsset,
  verifySanityStudioUser,
  type SanityConnection,
  type SanityPost,
} from '@/lib/blog-narration-sanity'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ELEVENLABS_API_ROOT = 'https://api.elevenlabs.io'
const GENERATION_ROLES = new Set(['administrator', 'developer', 'editor', 'write'])

const requestSchema = z.object({
  documentId: z
    .string()
    .min(1)
    .max(200)
    .regex(/^(?:drafts\.)?[A-Za-z0-9._-]+$/),
  regenerate: z.boolean().optional().default(false),
  documentType: z.enum(['blogPost', 'caseStudy']).optional().default('blogPost'),
})

function bearerToken(request: Request) {
  const authorization = request.headers.get('authorization')
  return authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : ''
}

function narrationScript(post: SanityPost) {
  return buildBlogNarrationScript({
    title: post.title,
    excerpt: post.excerpt ?? post.summary,
    content: post.content,
    scriptOverride: post.narration?.scriptOverride,
  })
}

function sourceHash(script: string) {
  return createHash('sha256').update(script).digest('hex')
}

function withoutGenerationError(post: SanityPost) {
  const narration = { ...post.narration }
  delete narration.generationError
  return narration
}

async function bestEffortMarkError(
  connection: SanityConnection,
  documentId: string,
  documentType: SanityPost['_type'],
  message: string,
) {
  try {
    const current = await findSanityPostById(connection, documentId, documentType)
    if (!current) return
    await patchNarration(connection, current, {
      ...current.narration,
      generationStatus: 'error',
      generationError: message.slice(0, 500),
    })
  } catch (error) {
    console.error('Could not record narration generation error.', error)
  }
}

export async function POST(request: Request) {
  const studioToken = bearerToken(request)
  if (!studioToken) {
    return Response.json(
      { error: 'Sign in to Sanity Studio before generating audio.' },
      { status: 401 },
    )
  }

  let payload: z.infer<typeof requestSchema>
  try {
    payload = requestSchema.parse(await request.json())
  } catch {
    return Response.json({ error: 'The narration request is invalid.' }, { status: 400 })
  }

  let connection: SanityConnection
  let elevenLabs: ReturnType<typeof resolveBlogNarrationConfiguration>['elevenLabs']
  try {
    const configuration = resolveBlogNarrationConfiguration()
    connection = configuration.sanity
    elevenLabs = configuration.elevenLabs
  } catch (error) {
    console.error('Narration route configuration failed.', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Narration generation is not configured.',
      },
      { status: 503 },
    )
  }

  try {
    const user = await verifySanityStudioUser({ ...connection, token: studioToken })
    if (!user) {
      return Response.json(
        { error: 'Your Sanity Studio session could not be verified.' },
        { status: 401 },
      )
    }
    if (!GENERATION_ROLES.has(user.role)) {
      return Response.json(
        { error: 'Your Sanity role cannot generate narration.' },
        { status: 403 },
      )
    }
  } catch (error) {
    console.error('Sanity Studio user verification failed.', error)
    return Response.json(
      { error: 'Sanity Studio could not be reached to verify your session. Try again.' },
      { status: 502 },
    )
  }

  let post: SanityPost | undefined
  try {
    const requestedPost = await findSanityPostById(
      connection,
      payload.documentId,
      payload.documentType,
    )
    if (requestedPost && !payload.regenerate) {
      const requestedScript = narrationScript(requestedPost)
      if (
        requestedScript &&
        requestedPost.narration?.sourceHash === sourceHash(requestedScript) &&
        requestedPost.narration.audioFile?.asset?._ref
      ) {
        return Response.json({ status: 'current', documentId: requestedPost._id })
      }
    }

    post = await ensureDraftSanityPost(connection, payload.documentId, payload.documentType)
    const script = narrationScript(post)
    if (!script) throw new Error('Add content or a narration script before generating audio.')

    const hash = sourceHash(script)
    if (
      !payload.regenerate &&
      post.narration?.sourceHash === hash &&
      post.narration.audioFile?.asset?._ref
    ) {
      return Response.json({ status: 'current', documentId: post._id })
    }

    post = await patchNarration(connection, post, {
      ...withoutGenerationError(post),
      generationStatus: 'generating',
    })

    const generated = await generateNarrationAudio({
      apiRoot: ELEVENLABS_API_ROOT,
      apiKey: elevenLabs.apiKey,
      voiceId: elevenLabs.voiceId,
      model: elevenLabs.model,
      chunks: splitNarrationScript(script, blogNarrationChunkLimit(elevenLabs.model)),
    })

    const current = await findSanityPostById(connection, post._id, payload.documentType)
    if (!current || sourceHash(narrationScript(current)) !== hash) {
      throw new Error('The content changed during generation. Review it and generate again.')
    }

    const assetId = await uploadNarrationAsset({
      connection,
      audio: generated.audio,
      filename: `${current.slug.current}-narration.mp3`,
    })
    const completed = await patchNarration(connection, current, {
      ...withoutGenerationError(current),
      audioFile: {
        _type: 'file',
        asset: { _type: 'reference', _ref: assetId },
      },
      durationSeconds: generated.durationSeconds,
      provider: 'elevenlabs',
      model: elevenLabs.model,
      voiceId: elevenLabs.voiceId,
      voiceName: elevenLabs.voiceName,
      sourceHash: hash,
      generatedAt: new Date().toISOString(),
      generationStatus: 'ready',
    })

    return Response.json({
      status: 'ready',
      documentId: completed._id,
      durationSeconds: generated.durationSeconds,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Narration generation failed.'
    console.error('Narration generation failed.', error)
    if (post) await bestEffortMarkError(connection, post._id, payload.documentType, message)
    return Response.json({ error: message }, { status: 500 })
  }
}
