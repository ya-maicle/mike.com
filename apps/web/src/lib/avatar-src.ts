export function isExternalUrl(src: string) {
  return /^https?:\/\//i.test(src)
}

export function toAvatarProxy(src: string) {
  if (!src) return src
  if (!isExternalUrl(src)) return src
  return `/api/avatar?src=${encodeURIComponent(src)}`
}
