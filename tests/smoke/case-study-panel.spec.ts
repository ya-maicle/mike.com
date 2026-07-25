import { expect, test } from '@playwright/test'

test.describe('Case study project panel', () => {
  test('contains full-bleed content and keeps cookie consent above the panel', async ({ page }) => {
    await page.setViewportSize({ width: 2048, height: 1228 })
    await page.goto('/work/tap')

    const layout = page.locator('[data-case-study-layout]')
    const main = layout.locator('[data-case-study-main]')
    const panel = layout.locator('[data-case-study-panel]')
    const carousel = main.locator('.carousel-bleed')
    const prompt = page.getByRole('region', { name: 'Cookie consent' })

    await expect(layout).toHaveAttribute('data-panel-open', 'false')
    await expect(carousel).toHaveCount(1)
    await expect(prompt).toBeVisible()

    await page.getByRole('button', { name: 'About the project', exact: true }).click()
    await expect(layout).toHaveAttribute('data-panel-open', 'true')

    await expect
      .poll(async () => {
        const [mainBox, panelBox, carouselBox] = await Promise.all([
          main.boundingBox(),
          panel.boundingBox(),
          carousel.boundingBox(),
        ])

        if (!mainBox || !panelBox || !carouselBox || panelBox.width === 0) return false

        return carouselBox.x >= mainBox.x - 1 && carouselBox.x + carouselBox.width <= panelBox.x + 1
      })
      .toBe(true)

    const carouselMetrics = await carousel.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(carouselMetrics.scrollWidth).toBeGreaterThan(carouselMetrics.clientWidth)

    const promptIsTopmost = await prompt.evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      const inset = 8
      const points = [
        [bounds.left + inset, bounds.top + inset],
        [bounds.right - inset, bounds.top + inset],
        [bounds.left + inset, bounds.bottom - inset],
        [bounds.right - inset, bounds.bottom - inset],
        [bounds.left + bounds.width / 2, bounds.top + bounds.height / 2],
      ]

      return points.every(([x, y]) => {
        const topmost = document.elementFromPoint(x, y)
        return topmost !== null && element.contains(topmost)
      })
    })

    expect(promptIsTopmost).toBe(true)
  })
})
