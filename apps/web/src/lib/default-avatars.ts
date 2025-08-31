'use client'

// Public paths for default avatars. These are served from `apps/web/public`.
export const DEFAULT_AVATARS = [
  '/default-avatars/avatar-1.png',
  '/default-avatars/avatar-2.png',
  '/default-avatars/avatar-3.png',
  '/default-avatars/avatar-4.png',
  '/default-avatars/avatar-5.png',
  '/default-avatars/avatar-6.png',
]

// Simple 32-bit hash for deterministic selection when a seed is provided
function hash32(input: string): number {
  let h = 0x811c9dc5 | 0 // FNV-1a basis
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function pickRandomDefaultAvatar(seed?: string): string {
  const n = DEFAULT_AVATARS.length
  if (n === 0) return ''
  if (seed) {
    const idx = hash32(seed) % n
    return DEFAULT_AVATARS[idx]
  }
  const idx = Math.floor(Math.random() * n)
  return DEFAULT_AVATARS[idx]
}
