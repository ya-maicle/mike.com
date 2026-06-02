import { describe, expect, it } from 'vitest'

import { programPath } from '@/lib/program-display'

describe('programPath', () => {
  it('builds a slugged strength path', () => {
    expect(programPath('brand-refresh')).toBe('/strengths/brand-refresh')
  })

  it('falls back to the index when the slug is missing', () => {
    expect(programPath(undefined)).toBe('/strengths')
    expect(programPath(null)).toBe('/strengths')
  })

  it('treats an empty slug as missing', () => {
    expect(programPath('')).toBe('/strengths')
  })
})
