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
    // Get the base URL from Playwright config
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://mikeiu.com'
    const domain = new URL(baseURL).hostname

    // The correct cookie name is `__vercel_bypass` for Vercel deployment protection
    await page.context().addCookies([
      {
        name: '__vercel_bypass',
        value: bypassSecret,
        domain: domain,
        path: '/',
      },
    ])
  }
})

test.describe('Preview Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()

    // Check that the H1 heading exists and is not empty
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).not.toBeEmpty()
  })
})
