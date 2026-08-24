import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const API_VERSION = 'v2025-01-01'
const OUTPUT_FORMAT = 'mp3_44100_128'

type SanityConnection = {
  projectId: string
  dataset: string
  token: string
}

export type SanityPost = {
  _id: string
  _rev: string
  title: string
  excerpt?: string
  slug: { current: string }
  content?: Array<{ _type?: string; children?: Array<{ text?: string }> }>
  narration?: {
    scriptOverride?: string
    sourceHash?: string
    audioFile?: { asset?: { _ref?: string } }
  }
}

function sanityUrl(connection: SanityConnection, path: string) {
  return new URL(
    `https://${connection.projectId}.api.sanity.io/${API_VERSION}/${path}/${connection.dataset}`,
  )
}

export async function findSanityPost(connection: SanityConnection, slug: string) {
  const url = sanityUrl(connection, 'data/query')
  url.searchParams.set(
    'query',
    `*[_type == "blogPost" && slug.current == $slug]{
      _id, _rev, title, excerpt, slug,
      content[]{ _type, children[]{ text } },
      narration{ scriptOverride, sourceHash, audioFile{ asset } }
    }`,
  )
  url.searchParams.set('perspective', 'raw')
  url.searchParams.set('$slug', JSON.stringify(slug))

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${connection.token}` },
  })
  if (!response.ok) throw new Error(`Sanity query failed (${response.status}).`)
  const documents = ((await response.json()) as { result: SanityPost[] }).result
  return documents.find(({ _id }) => _id.startsWith('drafts.')) ?? documents[0]
}

export async function listElevenLabsVoices({
  apiRoot,
  apiKey,
  write,
}: {
  apiRoot: string
  apiKey: string
  write: (line: string) => void
}) {
  const response = await fetch(`${apiRoot}/v1/voices`, { headers: { 'xi-api-key': apiKey } })
  if (!response.ok) throw new Error(`ElevenLabs voice lookup failed (${response.status}).`)
  const payload = (await response.json()) as {
    voices?: Array<{
      voice_id: string
      name: string
      category?: string
      labels?: Record<string, string>
    }>
  }
  for (const voice of payload.voices ?? []) {
    const labels = Object.entries(voice.labels ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    write(
      `${voice.name}\t${voice.voice_id}\t${voice.category ?? 'unknown'}${labels ? `\t${labels}` : ''}`,
    )
  }
}

async function synthesizeChunk({
  apiRoot,
  apiKey,
  voiceId,
  model,
  text,
  previousText,
  nextText,
}: {
  apiRoot: string
  apiKey: string
  voiceId: string
  model: string
  text: string
  previousText?: string
  nextText?: string
}) {
  const url = new URL(`${apiRoot}/v1/text-to-speech/${voiceId}`)
  url.searchParams.set('output_format', OUTPUT_FORMAT)
  const response = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({
      text,
      model_id: model,
      ...(previousText ? { previous_text: previousText } : {}),
      ...(nextText ? { next_text: nextText } : {}),
    }),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error(`ElevenLabs generation failed (${response.status}): ${detail}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function run(command: string, args: string[], captureOutput = false) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    let errorOutput = ''
    child.stdout.on('data', (chunk) => {
      if (captureOutput) output += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      errorOutput += String(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(output)
      else reject(new Error(`${command} failed (${code}): ${errorOutput.slice(-1_000)}`))
    })
  })
}

async function assembleAudio(chunkPaths: string[], outputPath: string, workDirectory: string) {
  let concatInput: string[]
  if (chunkPaths.length === 1) {
    concatInput = ['-i', chunkPaths[0]]
  } else {
    const concatPath = join(workDirectory, 'chunks.txt')
    const fileList = chunkPaths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join('\n')
    await writeFile(concatPath, fileList, 'utf8')
    concatInput = ['-f', 'concat', '-safe', '0', '-i', concatPath]
  }
  await run('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    ...concatInput,
    '-vn',
    '-ar',
    '44100',
    '-ac',
    '1',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    '128k',
    '-y',
    outputPath,
  ])
}

export async function generateNarrationAudio({
  apiRoot,
  apiKey,
  voiceId,
  model,
  chunks,
  slug,
  workDirectory,
  onProgress,
}: {
  apiRoot: string
  apiKey: string
  voiceId: string
  model: string
  chunks: string[]
  slug: string
  workDirectory: string
  onProgress: (line: string) => void
}) {
  const chunkPaths: string[] = []
  for (const [index, chunk] of chunks.entries()) {
    onProgress(`Generating chunk ${index + 1}/${chunks.length}…`)
    const audio = await synthesizeChunk({
      apiRoot,
      apiKey,
      voiceId,
      model,
      text: chunk,
      previousText: chunks[index - 1]?.slice(-1_000),
      nextText: chunks[index + 1]?.slice(0, 1_000),
    })
    const path = join(workDirectory, `chunk-${String(index + 1).padStart(3, '0')}.mp3`)
    await writeFile(path, audio)
    chunkPaths.push(path)
  }

  const outputPath = join(workDirectory, `${slug}-narration.mp3`)
  await assembleAudio(chunkPaths, outputPath, workDirectory)
  const durationOutput = await run(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      outputPath,
    ],
    true,
  )
  const durationSeconds = Number.parseFloat(durationOutput)
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error('Generated audio has no duration.')
  }
  return { outputPath, durationSeconds }
}

export async function publishNarration({
  sanity,
  post,
  audioPath,
  narration,
}: {
  sanity: SanityConnection
  post: SanityPost
  audioPath: string
  narration: Record<string, unknown>
}) {
  const uploadUrl = sanityUrl(sanity, 'assets/files')
  uploadUrl.searchParams.set('filename', basename(audioPath))
  const bytes = await readFile(audioPath)
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sanity.token}`, 'Content-Type': 'audio/mpeg' },
    body: new Blob([bytes], { type: 'audio/mpeg' }),
  })
  if (!uploadResponse.ok) throw new Error(`Sanity audio upload failed (${uploadResponse.status}).`)
  const uploaded = (await uploadResponse.json()) as { document: { _id: string } }

  const mutationUrl = sanityUrl(sanity, 'data/mutate')
  mutationUrl.searchParams.set('visibility', 'sync')
  const mutationResponse = await fetch(mutationUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sanity.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: post._id,
            ifRevisionID: post._rev,
            set: {
              narration: {
                ...narration,
                audioFile: {
                  _type: 'file',
                  asset: { _type: 'reference', _ref: uploaded.document._id },
                },
              },
            },
          },
        },
      ],
    }),
  })
  if (!mutationResponse.ok) {
    throw new Error(`Sanity narration update failed (${mutationResponse.status}).`)
  }
}
