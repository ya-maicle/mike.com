import { test, expect } from '@playwright/test'

// Vercel Deployment Protection bypass headers
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const bypassHeaders = bypassSecret
  ? {
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : {}

test.describe('Production Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    // Pass bypass headers explicitly for API requests
    const res = await request.get('/api/health', {
      headers: bypassHeaders,
    })
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully (use first() since there are multiple navs)
    await expect(page.getByRole('navigation').first()).toBeVisible()

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })
})
