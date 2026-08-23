import { expect, test, type APIRequestContext } from '@playwright/test'

const SOCIAL_CRAWLER_USER_AGENT = 'facebookexternalhit/1.1'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function metaContent(html: string, attribute: 'name' | 'property', value: string) {
  const tag = html.match(
    new RegExp(`<meta[^>]+${attribute}=["']${escapeRegExp(value)}["'][^>]*>`, 'i'),
  )?.[0]

  return tag?.match(/content=["']([^"']*)["']/i)?.[1]
}

function canonicalHref(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]
  return tag?.match(/href=["']([^"']*)["']/i)?.[1]
}

function documentTitle(html: string) {
  return html.match(/<title>(.*?)<\/title>/i)?.[1]
}

async function crawlerGet(request: APIRequestContext, path: string) {
  return request.get(path, {
    headers: { 'user-agent': SOCIAL_CRAWLER_USER_AGENT },
  })
}

export function registerSeoSmokeTests() {
  test('crawler directives keep noindex pages fetchable', async ({ request }) => {
    const robotsResponse = await request.get('/robots.txt')
    expect(robotsResponse.status()).toBe(200)

    const robots = await robotsResponse.text()
    expect(robots).toContain('Disallow: /api/')
    for (const path of ['/login', '/studio/', '/debug/', '/deck']) {
      expect(robots).not.toContain(`Disallow: ${path}`)
    }

    const loginResponse = await crawlerGet(request, '/login')
    expect(loginResponse.status()).toBe(200)
    expect(metaContent(await loginResponse.text(), 'name', 'robots')).toContain('noindex')

    const deckResponse = await request.get('/deck', { maxRedirects: 0 })
    expect([302, 404]).toContain(deckResponse.status())
    expect(deckResponse.headers()['x-robots-tag']).toBe('noindex, nofollow')
  })

  test('social crawler receives complete, normalized card metadata', async ({ request }) => {
    const response = await crawlerGet(request, '/work')
    expect(response.status()).toBe(200)

    const html = await response.text()
    const description = metaContent(html, 'name', 'description')
    const image = metaContent(html, 'property', 'og:image')

    expect(canonicalHref(html)).toBe('https://mikeiu.com/work')
    expect(description).toBeTruthy()
    expect(description).not.toMatch(/\s{2,}|\r|\n/)
    expect(metaContent(html, 'property', 'og:title')).toBeTruthy()
    expect(metaContent(html, 'property', 'og:description')).toBe(description)
    expect(metaContent(html, 'property', 'og:url')).toBe('https://mikeiu.com/work')
    expect(image).toBe('https://mikeiu.com/social/work.jpg')
    expect(metaContent(html, 'property', 'og:image:alt')).toBe(
      'Selected product design case studies by Mike Iukhtenko',
    )
    expect(metaContent(html, 'name', 'twitter:card')).toBe('summary_large_image')
    expect(metaContent(html, 'name', 'twitter:image')).toBe(image)
    expect(metaContent(html, 'name', 'twitter:image:alt')).toBe(
      'Selected product design case studies by Mike Iukhtenko',
    )

    const imageResponse = await request.get(new URL(image!).pathname)
    expect(imageResponse.status()).toBe(200)
    expect(imageResponse.headers()['content-type']).toContain('image/jpeg')
    expect((await imageResponse.body()).byteLength).toBeGreaterThan(10_000)
  })

  test('case-study browser tabs lead with the project title', async ({ request }) => {
    const response = await crawlerGet(request, '/work/tap')
    expect(response.status()).toBe(200)

    const html = await response.text()
    const title = documentTitle(html)

    expect(title).toBe(metaContent(html, 'property', 'og:title'))
    expect(title).toBeTruthy()
    expect(title).not.toContain('Mike Iukhtenko')
  })

  test('identity structured data is emitted only on the homepage', async ({ request }) => {
    const homeResponse = await crawlerGet(request, '/')
    const homeHtml = await homeResponse.text()
    const jsonLd = homeHtml.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    )?.[1]

    expect(jsonLd).toBeTruthy()
    const graph = JSON.parse(jsonLd!)['@graph'] as Array<{ '@type': string }>
    expect(graph.map((node) => node['@type'])).toEqual(['Person', 'WebSite', 'ProfilePage'])

    const workResponse = await crawlerGet(request, '/work')
    expect(await workResponse.text()).not.toContain('application/ld+json')
  })
}
