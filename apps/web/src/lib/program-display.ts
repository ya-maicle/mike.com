export function programPath(slug?: string | null): string {
  return slug ? `/programs/${slug}` : '/programs'
}
