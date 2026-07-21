import { expect, test, type Page } from '@playwright/test'

const storageKey = 'cookie-preferences'
const analyticsScriptSelector = [
  'script[data-sdkn^="@vercel/analytics"]',
  'script[src*="va.vercel-scripts.com"]',
  'script[src*="/_vercel/insights"]',
].join(', ')
const speedInsightsScriptSelector = [
  'script[data-sdkn^="@vercel/speed-insights"]',
  'script[src*="vitals.vercel-insights.com"]',
  'script[src*="/_vercel/speed-insights"]',
].join(', ')

function getDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Cookie preferences' })
}

function getPrompt(page: Page) {
  return page.getByRole('region', { name: 'Cookie consent' })
}

async function openPreferences(page: Page) {
  const prompt = getPrompt(page)
  if (await prompt.isVisible()) {
    await prompt.getByRole('button', { name: 'Manage cookies' }).click()
  } else {
    await page.locator('footer').getByRole('button', { name: 'Manage cookies' }).click()
  }
  await expect(getDialog(page)).toBeVisible()
}

async function expectTrackingDisabled(page: Page) {
  await expect(page.locator(analyticsScriptSelector)).toHaveCount(0)
  await expect(page.locator(speedInsightsScriptSelector)).toHaveCount(0)

  const muxPlayer = page.locator('mux-player:not([data-mux-player-react-lazy-placeholder])').first()
  await expect(muxPlayer).toBeAttached({ timeout: 10_000 })
  await page.evaluate(() => customElements.whenDefined('mux-player'))
  await expect
    .poll(() =>
      muxPlayer.evaluate((element) => ({
        cookies: Boolean(element.getAttribute('disable-cookies') !== null),
        tracking: Boolean(element.getAttribute('disable-tracking') !== null),
      })),
    )
    .toEqual({ cookies: true, tracking: true })
}

test.describe('Cookie preferences', () => {
  test('opens the Sanity-managed cookie policy from Learn more', async ({ page }) => {
    await page.goto('/')

    const prompt = getPrompt(page)
    await expect(prompt).toBeVisible()
    const learnMore = prompt.getByRole('link', { name: 'Learn more' })
    await expect(learnMore).toHaveAttribute('href', '/cookie-policy')
    await learnMore.click()

    await expect(page).toHaveURL(/\/cookie-policy$/)
    await expect(prompt).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Cookie Policy' })).toBeVisible()

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect(prompt).toBeVisible()
  })

  test('hides the prompt while preferences are open and restores it if closed unsaved', async ({
    page,
  }) => {
    await page.goto('/')

    const prompt = getPrompt(page)
    await expect(prompt).toBeVisible()
    await prompt.getByRole('button', { name: 'Manage cookies' }).click()
    await expect(prompt).toBeHidden()
    await expect(getDialog(page)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(getDialog(page)).toBeHidden()
    await expect(prompt).toBeVisible()
  })

  test('defaults optional tracking off and persists that choice', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'muxData',
        value: 'legacy-viewer-data',
        url: new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').origin,
      },
    ])
    const trackingRequests: string[] = []
    page.on('request', (request) => {
      if (/litix\.io|va\.vercel-scripts\.com|vitals\.vercel-insights\.com/.test(request.url())) {
        trackingRequests.push(request.url())
      }
    })

    await page.goto('/')

    const dialog = getDialog(page)
    await expect(dialog).toBeHidden()
    await expect(getPrompt(page)).toBeVisible()
    await expectTrackingDisabled(page)
    await openPreferences(page)
    const necessary = dialog.getByRole('checkbox', { name: 'Strictly necessary' })
    const analytics = dialog.getByRole('checkbox', { name: 'Analytics and performance' })
    await expect(necessary).toBeChecked()
    await expect(necessary).toBeDisabled()
    await expect(analytics).not.toBeChecked()

    await dialog.getByRole('button', { name: 'Save preferences' }).click()
    await expect(dialog).toBeHidden()
    await expect(getPrompt(page)).toBeHidden()

    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      storageKey,
    )
    expect(saved).toMatchObject({ version: 1, choices: { analytics: false } })

    await page.reload()
    await expect(dialog).toBeHidden()
    await expect(getPrompt(page)).toBeHidden()
    await expectTrackingDisabled(page)
    expect(trackingRequests).toEqual([])

    const muxCookie = (await context.cookies()).find((cookie) => cookie.name === 'muxData')
    expect(muxCookie).toBeUndefined()
    expect(await page.evaluate(() => localStorage.getItem('muxData'))).toBeNull()
  })

  test('loads analytics only after opt-in and fully disables it after withdrawal', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    const dialog = getDialog(page)
    await expect(dialog).toBeHidden()
    const prompt = getPrompt(page)
    await expect(prompt).toBeVisible()
    await prompt.getByRole('button', { name: 'Accept analytics' }).click()
    await expect(prompt).toBeHidden()
    await expect.poll(() => page.locator(analyticsScriptSelector).count()).toBeGreaterThan(0)
    await expect.poll(() => page.locator(speedInsightsScriptSelector).count()).toBeGreaterThan(0)

    const muxPlayer = page
      .locator('mux-player:not([data-mux-player-react-lazy-placeholder])')
      .first()
    await expect(muxPlayer).toBeAttached({ timeout: 10_000 })
    await expect
      .poll(() =>
        muxPlayer.evaluate((element) => ({
          cookies: element.hasAttribute('disable-cookies'),
          tracking: element.hasAttribute('disable-tracking'),
        })),
      )
      .toEqual({ cookies: true, tracking: false })

    await page.locator('footer').getByRole('button', { name: 'Manage cookies' }).click()
    await expect(dialog).toBeVisible()
    const analytics = dialog.getByRole('checkbox', { name: 'Analytics and performance' })
    await analytics.uncheck()

    const reloaded = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame())
    await dialog.getByRole('button', { name: 'Save preferences' }).click()
    await reloaded
    await page.waitForLoadState('load')

    await expect(dialog).toBeHidden()
    await expectTrackingDisabled(page)
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      storageKey,
    )
    expect(saved).toMatchObject({ version: 1, choices: { analytics: false } })
    expect((await context.cookies()).find((cookie) => cookie.name === 'muxData')).toBeUndefined()
  })

  test('saves a first-visit rejection and does not prompt again', async ({ page }) => {
    await page.goto('/')

    const prompt = getPrompt(page)
    await expect(prompt).toBeVisible()
    await expectTrackingDisabled(page)
    await prompt.getByRole('button', { name: 'Reject analytics' }).click()
    await expect(prompt).toBeHidden()

    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      storageKey,
    )
    expect(saved).toMatchObject({ version: 1, choices: { analytics: false } })

    await page.reload()
    await expect(prompt).toBeHidden()
    await expectTrackingDisabled(page)
  })

  test('fails closed for corrupt and outdated stored preferences', async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 0,
          updatedAt: new Date().toISOString(),
          choices: { analytics: true },
        }),
      )
    }, storageKey)

    await page.goto('/')
    await expect(getDialog(page)).toBeHidden()
    await expect(getPrompt(page)).toBeVisible()
    await expectTrackingDisabled(page)
    await openPreferences(page)
    await expect(
      getDialog(page).getByRole('checkbox', { name: 'Analytics and performance' }),
    ).not.toBeChecked()
  })

  test('applies consent withdrawal across open tabs', async ({ page, context }) => {
    await page.goto('/')
    await getPrompt(page).getByRole('button', { name: 'Accept analytics' }).click()
    await expect.poll(() => page.locator(analyticsScriptSelector).count()).toBeGreaterThan(0)

    const otherPage = await context.newPage()
    await otherPage.goto('/')
    await expect(getDialog(otherPage)).toBeHidden()
    await otherPage.locator('footer').getByRole('button', { name: 'Manage cookies' }).click()
    await getDialog(otherPage)
      .getByRole('checkbox', { name: 'Analytics and performance' })
      .uncheck()

    const firstTabReloaded = page.waitForEvent(
      'framenavigated',
      (frame) => frame === page.mainFrame(),
    )
    const secondTabReloaded = otherPage.waitForEvent(
      'framenavigated',
      (frame) => frame === otherPage.mainFrame(),
    )
    await getDialog(otherPage).getByRole('button', { name: 'Save preferences' }).click()
    await Promise.all([firstTabReloaded, secondTabReloaded])
    await Promise.all([page.waitForLoadState('load'), otherPage.waitForLoadState('load')])

    await expectTrackingDisabled(page)
    await expectTrackingDisabled(otherPage)
  })

  test('keeps the dialog usable within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const prompt = getPrompt(page)
    await expect(prompt).toBeVisible()
    const promptBox = await prompt.boundingBox()
    expect(promptBox).not.toBeNull()
    expect(promptBox!.x).toBeGreaterThanOrEqual(0)
    expect(promptBox!.y).toBeGreaterThanOrEqual(0)
    expect(promptBox!.x + promptBox!.width).toBeLessThanOrEqual(390)
    expect(promptBox!.y + promptBox!.height).toBeLessThanOrEqual(844)
    await expect(prompt.getByRole('button', { name: 'Accept analytics' })).toBeVisible()
    await expect(prompt.getByRole('button', { name: 'Reject analytics' })).toBeVisible()

    const navigationToggle = page.getByRole('button', { name: 'Toggle navigation' })
    await navigationToggle.click()
    await expect(page.getByRole('link', { name: 'Work', exact: true })).toBeVisible()
    await expect(prompt).toBeHidden()

    await navigationToggle.click()
    await expect(prompt).toBeVisible()

    const dialog = getDialog(page)
    await expect(dialog).toBeHidden()
    await openPreferences(page)
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    expect(box!.y + box!.height).toBeLessThanOrEqual(844)
    expect(
      await dialog.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).borderTopLeftRadius),
      ),
    ).toBeGreaterThan(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await expect(dialog.getByRole('button', { name: 'Save preferences' })).toBeVisible()
  })
})
