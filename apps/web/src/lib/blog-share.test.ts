import { describe, expect, it } from 'vitest'

import { blogShareLinks } from '@/lib/blog-share'

describe('blog share links', () => {
  it('builds the X intent with the canonical URL and article description', () => {
    const links = blogShareLinks({
      url: 'https://mikeiu.com/blog/a-boundary',
      text: 'The boundary is the product.',
    })

    const x = new URL(links.x)
    expect(x.origin + x.pathname).toBe('https://x.com/intent/tweet')
    expect(x.searchParams.get('url')).toBe('https://mikeiu.com/blog/a-boundary')
    expect(x.searchParams.get('text')).toBe('The boundary is the product.')
  })

  it('opens the LinkedIn composer with the article description and canonical URL', () => {
    const { linkedIn } = blogShareLinks({
      url: 'https://mikeiu.com/blog/a-boundary',
      text: 'The boundary is the product.',
    })

    const url = new URL(linkedIn)
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/feed/')
    expect(url.searchParams.get('shareActive')).toBe('true')
    expect(url.searchParams.get('text')).toBe(
      'The boundary is the product.\n\nhttps://mikeiu.com/blog/a-boundary',
    )
  })
})
