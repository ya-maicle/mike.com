import { test, expect } from '@playwright/test'

/**
 * Preview Environment Smoke Tests
 *
 * These tests run against Vercel preview deployments to ensure basic functionality works.
 * They use the VERCEL_AUTOMATION_BYPASS_SECRET to bypass Vercel's deployment protection.
 */

test.describe('Preview Smoke Tests', () => {
  // Get the bypass secret from environment
  const bypassSecret = process.env['VERCEL_AUTOMATION_BYPASS_SECRET']

  test.beforeEach(async ({ page }) => {
    // Set the Vercel bypass cookie for page navigation
    if (bypassSecret) {
      const baseURL = process.env['PLAYWRIGHT_BASE_URL'] || 'https://mikeiu.com'
      await page.context().addCookies([
        {
          name: '__vercel_bypass',
          value: bypassSecret,
          domain: new URL(baseURL).hostname,
          path: '/',
        },
      ])
    }
  })

  test('Health API returns 200 and expected body', async ({ request }) => {
    // Add bypass header for API requests
    const headers: Record<string, string> = {}
    if (bypassSecret) {
      headers['x-vercel-bypass-secret'] = bypassSecret
    }

    const res = await request.get('/api/health', { headers })
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
    expect(typeof body.timestamp).toBe('string')
    // Verify timestamp is a valid ISO string
    expect(() => new Date(body.timestamp)).not.toThrow()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for the updated page title (still uses default Next.js template)
    await expect(page).toHaveTitle(/Create Next App/i)

    // Check for the "Get started by editing" text which is still present
    await expect(page.getByText('Get started by editing')).toBeVisible()

    // Check for the E2E pipeline test indicator that was added
    await expect(page.getByText('✅ E2E Branching Pipeline Test')).toBeVisible()

    // Check for the Next.js logo
    await expect(page.getByAltText('Next.js logo')).toBeVisible()

    // Check for main navigation/action buttons
    await expect(page.getByRole('link', { name: /deploy now/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /read our docs/i })).toBeVisible()

    // Check footer links are present
    await expect(page.getByRole('link', { name: /learn/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /examples/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /go to nextjs\.org/i })).toBeVisible()
  })
})
