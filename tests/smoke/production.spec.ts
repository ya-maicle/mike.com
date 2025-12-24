import { test, expect } from '@playwright/test'

test.describe('Production Smoke', () => {
  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully (use first() since there are multiple navs)
    await expect(page.getByRole('navigation').first()).toBeVisible()

    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible()
  })
})
