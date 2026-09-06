import { expect, test, type Locator } from '@playwright/test'

async function playback(player: Locator) {
  return player.evaluate((node) => {
    const media = node as HTMLVideoElement
    return { muted: media.muted, paused: media.paused, time: media.currentTime }
  })
}

const title = 'Product design showreel'

test('opens the selected film from the start with sound and restores the silent preview', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Play showreel with sound' })
  await trigger.scrollIntoViewIfNeeded()
  await expect(trigger.locator('svg')).toHaveCount(0)
  const preview = page.locator('[data-showreel-preview] mux-player')
  await expect.poll(async () => (await playback(preview)).paused).toBe(false)
  const selectedPlaybackId = await preview.getAttribute('playback-id')
  expect(selectedPlaybackId).toBeTruthy()
  await preview.evaluate((node) => {
    ;(node as HTMLVideoElement).currentTime = 12
  })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: title })
  const player = dialog.locator('mux-player')
  await expect.poll(async () => (await playback(player)).paused).toBe(false)
  expect(await playback(player)).toMatchObject({ muted: false, paused: false })
  expect((await playback(player)).time).toBeLessThan(5)
  expect(await playback(preview)).toMatchObject({ muted: true, paused: true })
  const bounds = await player.boundingBox()
  expect(bounds!.width).toBeCloseTo(1244, 0)
  expect(bounds!.x).toBeCloseTo(338, 0)
  await expect(dialog).toHaveCSS('background-color', 'rgb(0, 0, 0)')
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await expect(player).toHaveAttribute('playback-id', selectedPlaybackId!)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect.poll(async () => (await playback(preview)).paused).toBe(false)
  expect((await playback(preview)).muted).toBe(true)
  await trigger.click()
  await expect.poll(async () => (await playback(dialog.locator('mux-player'))).paused).toBe(false)
  expect((await playback(dialog.locator('mux-player'))).time).toBeLessThan(5)
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(dialog.locator('mux-player')).toHaveCount(0)
})

test('keeps a manually paused preview paused after the lightbox closes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pause background preview' }).click()
  const preview = page.locator('[data-showreel-preview] mux-player')
  await expect.poll(async () => (await playback(preview)).paused).toBe(true)
  await page.getByRole('button', { name: 'Play showreel with sound' }).click()
  const dialog = page.getByRole('dialog', { name: title })
  await expect.poll(async () => (await playback(dialog.locator('mux-player'))).paused).toBe(false)
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect.poll(async () => (await playback(preview)).paused).toBe(true)
})

test('fits the entire landscape film on mobile and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Play showreel with sound' })
  await trigger.scrollIntoViewIfNeeded()
  const preview = page.locator('[data-showreel-preview] mux-player')
  await expect(preview).toBeAttached()
  await expect(page.getByRole('button', { name: 'Pause background preview' })).toHaveCount(0)
  await expect.poll(async () => (await playback(preview)).paused).toBe(true)
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: title })
  const player = dialog.locator('mux-player')
  await expect.poll(async () => (await playback(player)).paused).toBe(false)
  const box = await player.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 2)
  expect(box!.x).toBeGreaterThanOrEqual(15)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  expect(box!.y + box!.height / 2).toBeCloseTo(422, 0)
  expect((await playback(player)).muted).toBe(false)
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
      true,
    )
  }
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(dialog).toBeHidden()
})
