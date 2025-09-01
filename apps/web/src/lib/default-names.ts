'use client'

export const DEFAULT_NAMES = [
  'Anonymous Kraken',
  'Anonymous Blobfish',
  'Anonymous Quokka',
  'Anonymous Unicorn',
  'Anonymous Dumbo Octopus',
  'Anonymous Auroch',
  'Anonymous Nyan Cat',
  'Anonymous Ifrit',
  'Anonymous Quagga',
]

function hash32(input: string): number {
  let h = 0x811c9dc5 | 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function pickRandomDefaultName(seed?: string): string {
  const n = DEFAULT_NAMES.length
  if (n === 0) return 'Anonymous'
  if (seed) {
    const idx = hash32(seed) % n
    return DEFAULT_NAMES[idx]
  }
  return DEFAULT_NAMES[Math.floor(Math.random() * n)]
}
