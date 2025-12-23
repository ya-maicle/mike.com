import { test, expect } from '@playwright/test'

// Vercel Deployment Protection bypass secret
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

test.describe('Production Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    // Pass bypass header explicitly for API requests (extraHTTPHeaders only applies to browser contexts)
    const res = await request.get('/api/health', {
      headers: bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {},
    })
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully (navigation exists - use first() since there are multiple navs)
    await expect(page.getByRole('navigation').first()).toBeVisible()

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })
})
