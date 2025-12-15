/**
 * Validates that a URL path is safe for redirect (prevents open redirect attacks).
 * Only allows relative paths that start with "/" and don't contain protocol indicators.
 */
export function isValidReturnPath(path: string | null): boolean {
  if (!path || typeof path !== 'string') return false

  if (!path.startsWith('/')) return false

  if (path.startsWith('//')) return false

  if (path.includes('\\')) return false

  if (path.includes('://')) return false

  const lowerPath = path.toLowerCase()
  if (lowerPath.includes('javascript:') || lowerPath.includes('data:')) return false

  if (path === '/login' || path.startsWith('/login?') || path.startsWith('/login#')) return false

  return true
}
