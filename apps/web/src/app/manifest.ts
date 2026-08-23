import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/lib/constants'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${SITE_CONFIG.name} — Product Design Portfolio`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'en-GB',
    categories: ['design', 'portfolio'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
