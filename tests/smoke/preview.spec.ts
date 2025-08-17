import { test, expect } from '@playwright/test'

// Skip tests if the bypass secret is not provided
test.skip(
  !process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  'VERCEL_AUTOMATION_BYPASS_SECRET is not set',
)

// Set the Vercel bypass secret as a cookie before each test
test.beforeEach(async ({ page }) => {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypassSecret) {
    // The cookie name `__prerender_bypass` is used by Vercel to bypass the authentication layer.
    await page.context().addCookies([
      {
        name: '__prerender_bypass',
        value: bypassSecret,
        url: new URL(page.url()).origin,
      },
    ])
  }
})

test.describe('Preview Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    const headers = { 'x-vercel-bypass-secret': bypassSecret! }

    const res = await request.get('/api/health', { headers })
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders the main heading', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for a stable, top-level heading.
    // This is a more robust check than the default Next.js template text.
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
    await expect(mainHeading).not.toBeEmpty()
  })
})
