import { test, expect } from '@playwright/test'

test.describe('Production Smoke', () => {
  // Health API test only runs on production (preview has Vercel Deployment Protection)
  test('Health API returns 200 and expected body', async ({ request }) => {
    // Skip on preview environment due to Vercel Deployment Protection (SSO)
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || ''
    if (baseUrl.includes('preview')) {
      test.skip()
    }

    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully (navigation exists)
    await expect(page.getByRole('navigation')).toBeVisible()

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })
})
