import { expect, test, type Page, type Request } from '@playwright/test'
import { gunzipSync } from 'node:zlib'

const analyticsStorageKey = 'cookie-preferences'
const posthogHost = 'https://eu.i.posthog.com'

test.use({
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => false })
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      get: () => ({
        brands: [{ brand: 'Chromium', version: '126' }],
        mobile: false,
        platform: 'macOS',
      }),
    })
  })
})

function decodedRequestBody(request: Request) {
  const raw = request.postData() ?? ''
  const bodies = [raw]
  const buffer = request.postDataBuffer()

  if (buffer?.[0] === 0x1f && buffer[1] === 0x8b) {
    try {
      bodies.push(gunzipSync(buffer).toString('utf8'))
    } catch {
      // Keeping the raw body still makes an unexpected gzip payload diagnosable.
    }
  }

  try {
    const encoded = new URLSearchParams(raw).get('data')
    if (encoded) {
      bodies.push(decodeURIComponent(encoded))
      if (/^[A-Za-z0-9+/]+=*$/.test(encoded)) {
        bodies.push(Buffer.from(encoded, 'base64').toString('utf8'))
      }
    }
  } catch {
    // Keeping the raw body still makes an unexpected transport format diagnosable.
  }

  return bodies.join('\n')
}

function eventCount(requests: Request[], eventName: string) {
  return requests.reduce((count, request) => {
    const body = decodedRequestBody(request)
    const matches = body.match(
      new RegExp(`"event"\\s*:\\s*"${eventName.replace('$', '\\$')}"`, 'g'),
    )
    return count + (matches?.length ?? 0)
  }, 0)
}

async function interceptPostHog(page: Page) {
  const requests: Request[] = []

  page.on('request', (request) => {
    if (request.url().startsWith(posthogHost)) requests.push(request)
  })
  if (process.env.POSTHOG_E2E_PASSTHROUGH !== 'true') {
    await page.route(`${posthogHost}/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
  }

  return requests
}

async function grantAnalyticsConsent(page: Page) {
  await page
    .getByRole('region', { name: 'Cookie consent' })
    .getByRole('button', {
      name: 'Accept analytics',
    })
    .click()
}

async function seedAnalyticsConsent(page: Page) {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        choices: { analytics: true },
      }),
    )
  }, analyticsStorageKey)
}

async function posthogPersistence(page: Page) {
  return page.evaluate(() => ({
    localStorage: Object.keys(localStorage).filter((key) =>
      /^(?:ph_.*_posthog|__ph_opt_in_out_)/.test(key),
    ),
    sessionStorage: Object.keys(sessionStorage).filter((key) =>
      /^(?:ph_.*_posthog|__ph_opt_in_out_)/.test(key),
    ),
    cookies: document.cookie
      .split(';')
      .map((entry) => decodeURIComponent(entry.split('=', 1)[0]?.trim() ?? ''))
      .filter((key) => /^(?:ph_.*_posthog|__ph_opt_in_out_)/.test(key)),
  }))
}

test.describe('PostHog analytics V2', () => {
  test.describe.configure({ timeout: 60_000 })

  test('loads only after consent, strips URL secrets, and captures pathname pageviews', async ({
    page,
  }) => {
    const requests = await interceptPostHog(page)

    await page.goto('/?code=oauth-secret&k=recruiter-secret&auth_return_to=/work/private')
    await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible()
    expect(requests).toHaveLength(0)
    expect(await posthogPersistence(page)).toEqual({
      localStorage: [],
      sessionStorage: [],
      cookies: [],
    })

    await grantAnalyticsConsent(page)
    await expect.poll(() => requests.length, { timeout: 10_000 }).toBeGreaterThan(0)
    await expect.poll(() => eventCount(requests, '$pageview'), { timeout: 10_000 }).toBe(1)
    await expect
      .poll(async () => (await posthogPersistence(page)).localStorage.length)
      .toBeGreaterThan(0)

    await page.evaluate(() => window.history.pushState(null, '', '/work'))
    await expect(page).toHaveURL(/\/work$/)
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(2)

    const payloads = requests.map(decodedRequestBody).join('\n')
    expect(payloads).not.toContain('oauth-secret')
    expect(payloads).not.toContain('recruiter-secret')
    expect(payloads).not.toContain('auth_return_to')
    expect(payloads).not.toContain('g.maicle@gmail.com')
  })

  test('honours Do Not Track even when analytics consent is already stored', async ({ page }) => {
    await seedAnalyticsConsent(page)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'doNotTrack', { configurable: true, get: () => '1' })
      localStorage.setItem('ph_existing_posthog', 'legacy-identity')
      localStorage.setItem('__ph_opt_in_out_existing', '1')
      sessionStorage.setItem('ph_existing_posthog', 'legacy-session')
      document.cookie = 'ph_existing_posthog=legacy-cookie; Path=/; SameSite=Lax'
    })
    const requests = await interceptPostHog(page)

    await page.goto('/')
    await page.waitForTimeout(1_000)

    expect(requests).toHaveLength(0)
    expect(await posthogPersistence(page)).toEqual({
      localStorage: [],
      sessionStorage: [],
      cookies: [],
    })
  })

  test('captures case-study, access-start, and contact events without private destinations', async ({
    page,
  }) => {
    await seedAnalyticsConsent(page)
    const requests = await interceptPostHog(page)
    await page.route('**/auth/v1/authorize**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<p>OAuth intercepted</p>',
      })
    })

    await page.goto('/work/tap')
    await expect.poll(() => eventCount(requests, 'case_study_viewed')).toBe(1)
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(1)

    await page.goto('/work/care-ai-studio')
    await expect(page.getByText('Log in to view this case study')).toBeVisible()
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(2)
    await page.getByRole('main').getByRole('button', { name: 'Log in' }).click()
    await Promise.all([
      page.waitForURL('**/auth/v1/authorize**'),
      page.getByRole('button', { name: 'Continue with Google' }).click(),
    ])
    await expect.poll(() => eventCount(requests, 'portfolio_access_started')).toBe(1)

    await page.goto('/strengths/finding-the-direction')
    await expect
      .poll(() => eventCount(requests, '$pageview'), { timeout: 10_000 })
      .toBeGreaterThanOrEqual(3)
    const contact = page.locator('a[href^="mailto:"]').first()
    await expect(contact).toBeVisible()
    await contact.dispatchEvent('click')
    await expect.poll(() => eventCount(requests, 'contact_clicked'), { timeout: 10_000 }).toBe(1)

    const payloads = requests.map(decodedRequestBody).join('\n')
    expect(payloads).not.toContain('ya@maicle.co.uk')
    expect(payloads).not.toContain('playback_id')
    expect(payloads).not.toContain('playback_url')
  })

  test('captures blog discovery, post views, and meaningful reading engagement', async ({
    page,
  }) => {
    await seedAnalyticsConsent(page)
    const requests = await interceptPostHog(page)

    await page.goto('/blog')
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(1)

    const featuredLink = page
      .locator(
        'section[aria-label="Featured articles"] a[data-analytics-blog-card-placement="featured"]',
      )
      .first()
    await expect(featuredLink).toBeVisible()
    const postSlug = await featuredLink.getAttribute('data-analytics-blog-post-slug')
    expect(postSlug).toBeTruthy()

    await Promise.all([page.waitForURL(new RegExp(`/blog/${postSlug}$`)), featuredLink.click()])

    await expect.poll(() => eventCount(requests, 'blog_card_clicked')).toBe(1)
    await expect.poll(() => eventCount(requests, 'blog_post_viewed')).toBe(1)
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(2)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(31_000)
    await expect.poll(() => eventCount(requests, 'blog_post_engaged')).toBe(1)

    const payloads = requests.map(decodedRequestBody).join('\n')
    expect(payloads).toContain('"page_type":"blog_post"')
    expect(payloads).toContain('"card_placement":"featured"')
    expect(payloads).toContain(`"post_slug":"${postSlug}"`)
  })

  test('removes PostHog identity and persistence when consent is withdrawn', async ({ page }) => {
    const requests = await interceptPostHog(page)
    await page.goto('/')
    await grantAnalyticsConsent(page)
    await expect.poll(() => eventCount(requests, '$pageview')).toBe(1)
    await expect
      .poll(async () => (await posthogPersistence(page)).localStorage.length)
      .toBeGreaterThan(0)

    await page.locator('footer').getByRole('button', { name: 'Manage cookies' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cookie preferences' })
    await dialog.getByRole('checkbox', { name: 'Analytics and performance' }).uncheck()

    const reloaded = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame())
    await dialog.getByRole('button', { name: 'Save preferences' }).click()
    await reloaded
    await page.waitForLoadState('load')

    expect(await posthogPersistence(page)).toEqual({
      localStorage: [],
      sessionStorage: [],
      cookies: [],
    })
  })
})
