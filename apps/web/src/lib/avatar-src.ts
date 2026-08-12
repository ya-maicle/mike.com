const PROXIED_AVATAR_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'secure.gravatar.com',
  'pbs.twimg.com',
  'platform-lookaside.fbsbx.com',
])

const PUBLIC_AVATAR_STORAGE_PATH = '/storage/v1/object/public/avatars/'

export function isExternalUrl(src: string) {
  return /^https?:\/\//i.test(src)
}

function getSupabaseHostname(supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!supabaseUrl) return null

  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return null
  }
}

export function isAllowedAvatarProxyUrl(
  url: URL,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) {
  if (url.protocol !== 'https:') return false
  if (PROXIED_AVATAR_HOSTS.has(url.hostname)) return true

  return (
    url.hostname === getSupabaseHostname(supabaseUrl) &&
    url.pathname.startsWith(PUBLIC_AVATAR_STORAGE_PATH)
  )
}

export function toAvatarProxy(src: string, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!src) return src
  if (!isExternalUrl(src)) return src

  try {
    const url = new URL(src)
    return isAllowedAvatarProxyUrl(url, supabaseUrl)
      ? `/api/avatar?src=${encodeURIComponent(src)}`
      : src
  } catch {
    return src
  }
}
