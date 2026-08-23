import { describe, expect, it } from 'vitest'

import { fitCaseStudyImage, selectCaseStudyImage } from '@/lib/case-study-image'
import type { SanityImage } from '@/sanity/queries'

function image(width: number, height: number, id: string): SanityImage {
  return {
    _type: 'image',
    asset: {
      _id: id,
      metadata: { dimensions: { width, height } },
    },
  }
}

describe('selectCaseStudyImage', () => {
  const desktop = image(1600, 900, 'desktop')
  const mobile = image(1200, 1600, 'mobile')

  it('uses the art-directed asset on mobile', () => {
    expect(selectCaseStudyImage(desktop, mobile, true)).toBe(mobile)
  })

  it('falls back to desktop when a mobile asset is unavailable', () => {
    expect(selectCaseStudyImage(desktop, undefined, true)).toBe(desktop)
    expect(selectCaseStudyImage(desktop, mobile, false)).toBe(desktop)
  })
})

describe('fitCaseStudyImage', () => {
  it('fits a landscape image to the available width', () => {
    expect(
      fitCaseStudyImage(image(1600, 900, 'landscape'), { width: 400, height: 800 }, 112),
    ).toEqual({ width: 368, height: 207 })
  })

  it('fits a portrait image to the available height', () => {
    expect(
      fitCaseStudyImage(image(1200, 1600, 'portrait'), { width: 800, height: 800 }, 152),
    ).toEqual({ width: 486, height: 648 })
  })
})
