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
