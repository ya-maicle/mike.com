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

    // Check for the Next.js logo (reliable indicator the page loaded)
    await expect(page.getByAltText('Next.js logo')).toBeVisible()

    // Check for the "Get started by editing" text
    await expect(page.getByText('Get started by editing')).toBeVisible()

    // Check for the E2E pipeline test indicator
    await expect(page.getByText('✅ E2E Branching Pipeline Test')).toBeVisible()

    // Check for main action buttons
    await expect(page.getByRole('link', { name: /deploy now/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /read our docs/i })).toBeVisible()
  })
})
