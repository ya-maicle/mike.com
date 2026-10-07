import { isValidReturnPath } from './url-validation'

export function getSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const candidate = typeof window !== 'undefined' ? window.location.origin : configuredUrl
  if (!candidate) throw new Error('The site URL is not configured.')
  return new URL(candidate).origin
}

export function getReturnPath() {
  if (typeof window === 'undefined') return '/'
  try {
    const path = localStorage.getItem('auth-return-url')
    // Ordinary sign-in must never reuse an abandoned request intent.
    if (isValidReturnPath(path)) return path!.startsWith('/access#request=') ? '/access' : path!
  } catch {
    /* Storage is optional. */
  }
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return isValidReturnPath(current)
    ? current.startsWith('/access#request=')
      ? '/access'
      : current
    : '/'
}

export function rememberReturnPath(returnPath: string) {
  try {
    localStorage.setItem('auth-return-url', returnPath)
  } catch {
    /* Also carried by the provider redirect. */
  }
}

export function getOAuthRedirectUrl(origin: string, returnPath: string) {
  const url = new URL(origin)
  if (returnPath !== '/' && isValidReturnPath(returnPath))
    url.searchParams.set('auth_return_to', returnPath)
  return url.toString()
}

export function magicLinkErrorMessage(error: { message?: string; status?: number }) {
  return error.status === 429 || /rate|seconds|too many/i.test(error.message ?? '')
    ? 'Please wait a minute before requesting another sign-in link.'
    : 'We could not send the sign-in link. Please check the address and try again.'
}
