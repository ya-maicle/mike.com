import { test, expect } from '@playwright/test'
import { registerSeoSmokeTests } from './seo-assertions'

test.describe('Production Smoke', () => {
  registerSeoSmokeTests()

  test('Homepage renders expected content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
