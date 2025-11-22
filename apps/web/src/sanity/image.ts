/* eslint-disable */
// Lightweight URL builder that relies on the asset URL expanded via GROQ (asset->)
// Supports width/height options and always applies auto=format for optimal delivery
export function imageUrl(
  source: any,
  opts?: { width?: number; height?: number; fit?: 'clip' | 'crop' | 'scale' | 'min' },
) {
  const rawUrl: string | undefined = source?.asset?.url
  if (!rawUrl) return ''
  const url = new URL(rawUrl)
  url.searchParams.set('auto', 'format')
  if (opts?.width) url.searchParams.set('w', String(opts.width))
  if (opts?.height) url.searchParams.set('h', String(opts.height))
  if (opts?.fit) url.searchParams.set('fit', opts.fit)
  return url.toString()
}
