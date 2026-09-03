import { createHash } from 'node:crypto'

import { z } from 'zod'

import { buildBlogNarrationScript, splitNarrationScript } from '@/lib/blog-narration'
import { generateNarrationAudio } from '@/lib/blog-narration-audio'
import {
  blogNarrationChunkLimit,
  DEFAULT_BLOG_NARRATION_MODEL,
  DEFAULT_BLOG_NARRATION_VOICE_ID,
  DEFAULT_BLOG_NARRATION_VOICE_NAME,
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

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`The server is missing ${name}.`)
  return value
}

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
  try {
    connection = {
      projectId: requiredEnvironment('NEXT_PUBLIC_SANITY_PROJECT_ID'),
      dataset: requiredEnvironment('NEXT_PUBLIC_SANITY_DATASET'),
      token: requiredEnvironment('SANITY_API_WRITE_TOKEN'),
    }
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
    console.error('Narration route configuration failed.', error)
    return Response.json({ error: 'Narration generation is not configured.' }, { status: 503 })
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

    const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_BLOG_NARRATION_VOICE_ID
    const voiceName = process.env.ELEVENLABS_VOICE_NAME?.trim() || DEFAULT_BLOG_NARRATION_VOICE_NAME
    const model = process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_BLOG_NARRATION_MODEL
    const generated = await generateNarrationAudio({
      apiRoot: ELEVENLABS_API_ROOT,
      apiKey: requiredEnvironment('ELEVENLABS_API_KEY'),
      voiceId,
      model,
      chunks: splitNarrationScript(script, blogNarrationChunkLimit(model)),
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
      model,
      voiceId,
      voiceName,
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
