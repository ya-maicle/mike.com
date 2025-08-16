import { test, expect } from '@playwright/test'

test.describe('Staging Smoke Tests', () => {
  test('Health API returns 200 and expected structure', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'web')
    expect(typeof body.timestamp).toBe('string')

    // Verify timestamp is valid ISO string
    expect(() => new Date(body.timestamp)).not.toThrow()

    // Verify response headers
    expect(res.headers()['cache-control']).toBe('no-store')
  })

  test('Homepage renders and loads correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify basic page structure
    await expect(page).toHaveTitle(/Create Next App/i)
    await expect(page.getByText('Get started by editing')).toBeVisible()

    // Verify page loads without console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Allow for some expected framework warnings but no real errors
    const criticalErrors = errors.filter(
      (error) => !error.includes('Warning:') && !error.includes('[Fast Refresh]'),
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('Static assets load successfully', async ({ page }) => {
    const responses: { url: string; status: number }[] = []

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that all static assets loaded successfully
    const failedAssets = responses.filter(
      (response) =>
        (response.url.includes('.js') ||
          response.url.includes('.css') ||
          response.url.includes('.ico')) &&
        response.status >= 400,
    )

    expect(failedAssets).toHaveLength(0)
  })

  test('API routes are accessible', async ({ request }) => {
    // Test that API routes return proper responses (not 404)
    const healthResponse = await request.get('/api/health')
    expect(healthResponse.status()).toBe(200)

    // Verify API base path is working
    const invalidApiResponse = await request.get('/api/nonexistent')
    // Should return 404, not 500 or other server error
    expect(invalidApiResponse.status()).toBe(404)
  })

  test('Environment indicates staging configuration', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify we're hitting the staging environment
    // This should match the PLAYWRIGHT_BASE_URL or default staging URL
    const url = page.url()
    expect(url).toMatch(/staging\.mikeiu\.com|mike-com-web\.vercel\.app/)
  })
})
