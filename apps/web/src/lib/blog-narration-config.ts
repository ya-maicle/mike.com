export const DEFAULT_BLOG_NARRATION_MODEL = 'eleven_multilingual_v2'
export const DEFAULT_BLOG_NARRATION_VOICE_ID = 'EkK5I93UQWFDigLMpZcX'
export const DEFAULT_BLOG_NARRATION_VOICE_NAME = 'James - Husky, Engaging and Bold'

const ELEVEN_V3_MAXIMUM_CHARACTERS = 5_000
const DEFAULT_MAXIMUM_CHARACTERS = 9_000

/** Leaves headroom below the provider's per-request character limit. */
export function blogNarrationChunkLimit(model: string) {
  return model === 'eleven_v3' ? ELEVEN_V3_MAXIMUM_CHARACTERS - 500 : DEFAULT_MAXIMUM_CHARACTERS
}
