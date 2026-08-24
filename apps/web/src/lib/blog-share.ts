export function blogShareLinks({ url, text }: { url: string; text: string }) {
  const x = new URL('https://x.com/intent/tweet')
  x.searchParams.set('url', url)
  x.searchParams.set('text', text)

  const linkedIn = new URL('https://www.linkedin.com/feed/')
  linkedIn.searchParams.set('shareActive', 'true')
  linkedIn.searchParams.set('text', `${text}\n\n${url}`)

  return { x: x.toString(), linkedIn: linkedIn.toString() }
}
