import { isValidReturnPath } from '@/lib/url-validation'

export const PORTFOLIO_ACCESS_DENIED_KEY = 'portfolio-access-denied'

export function isCaseStudyPath(path: string | null | undefined) {
  return !!path && /^\/work\/[^/?#]+/.test(path)
}

export function withAccessDenied(path: string) {
  if (!isValidReturnPath(path)) return '/'
  const [pathnameAndSearch, hash = ''] = path.split('#')
  const [pathname, search = ''] = pathnameAndSearch.split('?')
  const params = new URLSearchParams(search)
  params.set('access', 'denied')
  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}
