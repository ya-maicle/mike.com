import { test, expect } from '@playwright/test'

test.describe('Production Smoke', () => {
  test('Health API returns 200 and expected body', async ({ page }) => {
    // Use browser navigation instead of request fixture
    // Browser context has the bypass cookie set via extraHTTPHeaders
    const response = await page.goto('/api/health')

    expect(response?.status()).toBe(200)

    // Get JSON body from page content
    const bodyText = await page.textContent('body')
    const body = JSON.parse(bodyText || '{}')

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
