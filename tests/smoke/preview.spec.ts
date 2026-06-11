import { test, expect } from '@playwright/test'

// Skip tests if the bypass secret is not provided
test.skip(
  !process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  'VERCEL_AUTOMATION_BYPASS_SECRET is not set',
)

// Deployment-protection bypass is handled by the x-vercel-protection-bypass
// header configured in playwright.config.ts; no cookie setup is needed here.

test.describe('Preview Smoke', () => {
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

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()

    // Check that the H1 heading exists and is not empty
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).not.toBeEmpty()
  })

  test('/work page images serve responsive srcset with h+w params', async ({ page }) => {
    await page.goto('/work')
    await page.waitForLoadState('networkidle')

    const firstThumb = page.locator('a[href^="/work/"] img').first()
    await expect(firstThumb).toBeVisible({ timeout: 10_000 })

    const srcset = await firstThumb.getAttribute('srcset')
    expect(srcset, 'image must have a srcset').toBeTruthy()
    expect(srcset!.split(',').length, 'srcset must have multiple candidates').toBeGreaterThan(1)
    // Every Sanity candidate must have both w and h so the CDN can return the right pixels
    for (const candidate of srcset!.split(',')) {
      const url = candidate.trim().split(' ')[0]
      if (!url.includes('cdn.sanity.io')) continue
      expect(url, `srcset entry must include w param: ${url}`).toContain('w=')
      expect(url, `srcset entry must include h param: ${url}`).toContain('h=')
    }
  })
})
