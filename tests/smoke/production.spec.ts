import { test, expect } from '@playwright/test'

test.describe('Production Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
  })

  test('Homepage renders the main heading', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for a stable, top-level heading.
    // Replace this with a selector that is unique and stable for your homepage.
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
    await expect(mainHeading).not.toBeEmpty()
  })
})
