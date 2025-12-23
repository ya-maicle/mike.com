import { test, expect } from '@playwright/test'

test.describe('Production Smoke', () => {
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

    // Check that the page loaded successfully (navigation exists - use first() since there are multiple navs)
    await expect(page.getByRole('navigation').first()).toBeVisible()

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })
})
