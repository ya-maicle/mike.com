#!/usr/bin/env tsx
/* eslint-disable no-console */

import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { buildBlogNarrationScript, splitNarrationScript } from '../apps/web/src/lib/blog-narration'
import {
  findSanityPost,
  generateNarrationAudio,
  listElevenLabsVoices,
  publishNarration,
} from './lib/blog-narration-services'

const ELEVENLABS_API_ROOT = 'https://api.elevenlabs.io'
const DEFAULT_MODEL = 'eleven_multilingual_v2'
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'
const DEFAULT_VOICE_NAME = 'George'

type CliOptions = {
  slug?: string
  voiceId: string
  voiceName: string
  model: string
  dryRun: boolean
  force: boolean
  allowProduction: boolean
  listVoices: boolean
}

function optionValue(args: string[], name: string) {
  const index = args.indexOf(name)
  if (index < 0) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`)
  return value
}

function parseOptions(args: string[]): CliOptions {
  return {
    slug: optionValue(args, '--slug'),
    voiceId: optionValue(args, '--voice-id') ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID,
    voiceName:
      optionValue(args, '--voice-name') ?? process.env.ELEVENLABS_VOICE_NAME ?? DEFAULT_VOICE_NAME,
    model: optionValue(args, '--model') ?? process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL,
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    allowProduction: args.includes('--allow-production'),
    listVoices: args.includes('--list-voices'),
  }
}

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}.`)
  return value
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim()

  if (options.listVoices) {
    await listElevenLabsVoices({
      apiRoot: ELEVENLABS_API_ROOT,
      apiKey: elevenLabsApiKey || requireEnvironment('ELEVENLABS_API_KEY'),
      write: console.log,
    })
    return
  }
  if (!options.slug) throw new Error('Usage: pnpm blog:narrate -- --slug <article-slug>')

  const projectId = requireEnvironment('NEXT_PUBLIC_SANITY_PROJECT_ID')
  const dataset = requireEnvironment('NEXT_PUBLIC_SANITY_DATASET')
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim()
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim()
  if (dataset === 'production' && !options.allowProduction) {
    throw new Error('Refusing to update production without --allow-production.')
  }

  const sanity = {
    projectId,
    dataset,
    token: readToken || writeToken || requireEnvironment('SANITY_API_READ_TOKEN'),
  }
  const post = await findSanityPost(sanity, options.slug)
  if (!post) throw new Error(`No blog post found for slug “${options.slug}”.`)

  const script = buildBlogNarrationScript({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    scriptOverride: post.narration?.scriptOverride,
  })
  if (!script) throw new Error('The article produced an empty narration script.')
  const sourceHash = createHash('sha256').update(script).digest('hex')
  const chunks = splitNarrationScript(script)

  console.log(
    `Narration source: ${post.slug.current} · ${script.length.toLocaleString('en-GB')} characters · ${chunks.length} chunk${chunks.length === 1 ? '' : 's'}`,
  )
  console.log(`Voice: ${options.voiceName} (${options.voiceId}) · model: ${options.model}`)
  if (options.dryRun) return
  if (
    !options.force &&
    post.narration?.sourceHash === sourceHash &&
    post.narration.audioFile?.asset?._ref
  ) {
    console.log('Narration is already current. Use --force to regenerate it.')
    return
  }

  const workDirectory = await mkdtemp(join(tmpdir(), 'maicle-narration-'))
  try {
    const generated = await generateNarrationAudio({
      apiRoot: ELEVENLABS_API_ROOT,
      apiKey: elevenLabsApiKey || requireEnvironment('ELEVENLABS_API_KEY'),
      voiceId: options.voiceId,
      model: options.model,
      chunks,
      slug: post.slug.current,
      workDirectory,
      onProgress: console.log,
    })
    console.log(`Uploading ${Math.round(generated.durationSeconds)} seconds of audio to Sanity…`)
    await publishNarration({
      sanity: {
        projectId,
        dataset,
        token: writeToken || requireEnvironment('SANITY_API_WRITE_TOKEN'),
      },
      post,
      audioPath: generated.outputPath,
      narration: {
        ...(post.narration?.scriptOverride
          ? { scriptOverride: post.narration.scriptOverride }
          : {}),
        durationSeconds: generated.durationSeconds,
        provider: 'elevenlabs',
        model: options.model,
        voiceId: options.voiceId,
        voiceName: options.voiceName,
        sourceHash,
        generatedAt: new Date().toISOString(),
      },
    })
    console.log(`Narration is ready on ${post._id}.`)
  } finally {
    await rm(workDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
