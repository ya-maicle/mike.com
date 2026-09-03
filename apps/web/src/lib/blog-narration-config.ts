export const DEFAULT_BLOG_NARRATION_MODEL = 'eleven_multilingual_v2'
export const DEFAULT_BLOG_NARRATION_VOICE_ID = 'EkK5I93UQWFDigLMpZcX'
export const DEFAULT_BLOG_NARRATION_VOICE_NAME = 'James - Husky, Engaging and Bold'

const REQUIRED_ENVIRONMENT_VARIABLES = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_WRITE_TOKEN',
  'ELEVENLABS_API_KEY',
] as const

const ELEVEN_V3_MAXIMUM_CHARACTERS = 5_000
const DEFAULT_MAXIMUM_CHARACTERS = 9_000

export function resolveBlogNarrationConfiguration(
  environment: Record<string, string | undefined> = process.env,
) {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter((name) => !environment[name]?.trim())
  if (missing.length > 0) {
    throw new Error(
      `Narration generation is not configured. Missing server variables: ${missing.join(', ')}.`,
    )
  }

  return {
    sanity: {
      projectId: environment.NEXT_PUBLIC_SANITY_PROJECT_ID!.trim(),
      dataset: environment.NEXT_PUBLIC_SANITY_DATASET!.trim(),
      token: environment.SANITY_API_WRITE_TOKEN!.trim(),
    },
    elevenLabs: {
      apiKey: environment.ELEVENLABS_API_KEY!.trim(),
      voiceId: environment.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_BLOG_NARRATION_VOICE_ID,
      voiceName: environment.ELEVENLABS_VOICE_NAME?.trim() || DEFAULT_BLOG_NARRATION_VOICE_NAME,
      model: environment.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_BLOG_NARRATION_MODEL,
    },
  }
}

/** Leaves headroom below the provider's per-request character limit. */
export function blogNarrationChunkLimit(model: string) {
  return model === 'eleven_v3' ? ELEVEN_V3_MAXIMUM_CHARACTERS - 500 : DEFAULT_MAXIMUM_CHARACTERS
}
