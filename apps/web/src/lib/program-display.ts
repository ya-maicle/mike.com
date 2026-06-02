export function programPath(slug?: string | null): string {
  return slug ? `/strengths/${slug}` : '/strengths'
}

export function isStrengthDetailPath(pathname: string | null | undefined): boolean {
  return typeof pathname === 'string' && pathname.startsWith('/strengths/')
}
