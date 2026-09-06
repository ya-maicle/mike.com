import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HomePage } from '@/sanity/queries/home-page-queries'
import Home from './page'

const { fetchHome } = vi.hoisted(() => ({ fetchHome: vi.fn() }))
vi.mock('@/sanity/client', () => ({ sanityFetch: fetchHome }))
vi.mock('@/lib/portfolio-access', () => ({
  getPortfolioAccessState: async () => ({ hasRecruiterAccess: false }),
}))
vi.mock('@/components/home-showreel', () => ({
  HomeShowreel: ({ playbackId }: { playbackId: string }) =>
    React.createElement('video', { 'data-showreel': playbackId }),
}))
vi.mock('@/components/sanity-image', () => ({
  SanityImage: ({ image }: { image: { alt?: string } }) =>
    React.createElement('img', { alt: image.alt }),
}))
vi.mock('@/components/home-logo-strip', () => ({ HomeLogoStrip: () => null }))
vi.mock('@/components/programs-section', () => ({ ProgramsSection: () => null }))
vi.mock('@/components/featured-work-section', () => ({ FeaturedWorkSection: () => null }))

async function renderHome(coverMedia?: HomePage['coverMedia']) {
  fetchHome.mockResolvedValue({ _id: 'homePage', tagline: 'Design', coverMedia })
  return renderToStaticMarkup(await Home())
}

describe('homepage media selected in Sanity', () => {
  beforeEach(() => fetchHome.mockReset())

  it.each(['first-cms-video', 'replacement-cms-video'])(
    'passes the current CMS selection %s to the showreel',
    async (playbackId) => {
      const html = await renderHome({ type: 'video', video: { asset: { playbackId } } })
      expect(html).toContain(`data-showreel="${playbackId}"`)
    },
  )

  it('shows the selected image even if a previous video is still saved in the field', async () => {
    const html = await renderHome({
      type: 'image',
      image: { _type: 'image', asset: { _id: 'image-cover' }, alt: 'Selected cover' },
      video: { asset: { playbackId: 'previous-video' } },
    })
    expect(html).toContain('alt="Selected cover"')
    expect(html).not.toContain('data-showreel')
  })

  it.each([
    undefined,
    { type: 'video' as const },
    { type: 'video' as const, video: { asset: null } },
  ])(
    'does not fall back to a hardcoded video when media is absent or unresolved: %j',
    async (coverMedia) => {
      expect(await renderHome(coverMedia)).not.toContain('data-showreel')
    },
  )
})
