import { test, expect } from '@playwright/test'

test.describe('Staging Smoke', () => {
  test('Health API returns 200 and expected body', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
    expect(typeof body.timestamp).toBe('string')
    // Optional: basic timestamp shape check:
    expect(() => new Date(body.timestamp)).not.toThrow()
  })

  test('Homepage renders basic content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // The staging environment is currently running the default Next.js template.
    await expect(page).toHaveTitle(/Create Next App/i)

    // Check for the "Get started by editing" text, which is a reliable indicator of the default page.
    await expect(page.getByText('Get started by editing')).toBeVisible()
  })
})
