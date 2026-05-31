import { describe, expect, it } from 'vitest'

import { programPath } from '@/lib/program-display'

describe('programPath', () => {
  it('builds a slugged program path', () => {
    expect(programPath('brand-refresh')).toBe('/programs/brand-refresh')
  })

  it('falls back to the index when the slug is missing', () => {
    expect(programPath(undefined)).toBe('/programs')
    expect(programPath(null)).toBe('/programs')
  })

  it('treats an empty slug as missing', () => {
    expect(programPath('')).toBe('/programs')
  })
})
