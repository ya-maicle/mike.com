const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const SENSITIVE_QUERY = /[?&](?:code|k|access|auth_return_to|error(?:_description|_code)?)=/i
const URL_PROPERTY = /(?:url|referrer|href)$/i
const SENSITIVE_PROPERTY =
  /(?:^|_)(?:email|password|access_token|oauth_code|auth_return_to|recruiter_token|link_token|playback_id|playback_url|signed_url|secret)(?:$|_)/i

export type PostHogBeforeSendEvent = {
  event: string
  properties?: Record<string, unknown>
  $set?: Record<string, unknown>
  $set_once?: Record<string, unknown>
  $unset?: string[]
}

export function sanitizeAnalyticsUrl(value: string): string {
  try {
    const parsed = new URL(value, 'https://portfolio.invalid')
    if (parsed.origin === 'https://portfolio.invalid') return parsed.pathname
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return value.split(/[?#]/, 1)[0] ?? ''
  }
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (SENSITIVE_PROPERTY.test(key)) return undefined

  if (typeof value === 'string') {
    if (EMAIL_VALUE.test(value)) return undefined
    if (URL_PROPERTY.test(key) || SENSITIVE_QUERY.test(value)) return sanitizeAnalyticsUrl(value)
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(key, item)).filter((item) => item !== undefined)
  }

  if (value && typeof value === 'object') {
    return sanitizeAnalyticsProperties(value as Record<string, unknown>)
  }

  return value
}

export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(properties)) {
    const nextValue = sanitizeValue(key, value)
    if (nextValue !== undefined) sanitized[key] = nextValue
  }

  return sanitized
}

export function sanitizePostHogEvent<T extends PostHogBeforeSendEvent>(event: T): T {
  return {
    ...event,
    ...(event.properties ? { properties: sanitizeAnalyticsProperties(event.properties) } : {}),
    ...(event.$set ? { $set: sanitizeAnalyticsProperties(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: sanitizeAnalyticsProperties(event.$set_once) } : {}),
    ...(event.$unset
      ? { $unset: event.$unset.filter((key) => !SENSITIVE_PROPERTY.test(key)) }
      : {}),
  }
}
