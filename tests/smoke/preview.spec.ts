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

  test('/work page renders card media and Sanity images use responsive srcset', async ({
    page,
  }) => {
    await page.goto('/work')
    await page.waitForLoadState('networkidle')

    const media = await page.locator('a[href^="/work/"]').evaluateAll((cards) => {
      const isVisible = (element: Element) => {
        const bounds = element.getBoundingClientRect()
        const style = window.getComputedStyle(element)
        return bounds.width > 0 && bounds.height > 0 && style.display !== 'none'
      }
      const cardMedia = cards.flatMap((card) =>
        Array.from(card.querySelectorAll('img, mux-player, video')),
      )
      const sanityImages = cards
        .flatMap((card) => Array.from(card.querySelectorAll<HTMLImageElement>('img')))
        .map((image) => ({ src: image.src, srcset: image.srcset }))
        .filter(({ src, srcset }) => `${src} ${srcset}`.includes('cdn.sanity.io'))

      return {
        visibleCards: cards.filter(isVisible).length,
        visibleMedia: cardMedia.filter(isVisible).length,
        sanityImages,
      }
    })

    expect(media.visibleCards, 'at least one work card must be visible').toBeGreaterThan(0)
    expect(
      media.visibleMedia,
      'at least one work card must show image or video media',
    ).toBeGreaterThan(0)

    for (const { srcset } of media.sanityImages) {
      expect(srcset, 'Sanity images must have a srcset').toBeTruthy()
      expect(srcset.split(',').length, 'srcset must have multiple candidates').toBeGreaterThan(1)
      // Every Sanity candidate must include both dimensions for exact hotspot-aware crops.
      for (const candidate of srcset.split(',')) {
        const url = candidate.trim().split(' ')[0]
        expect(url, `srcset entry must include w param: ${url}`).toContain('w=')
        expect(url, `srcset entry must include h param: ${url}`).toContain('h=')
      }
    }
  })
})
