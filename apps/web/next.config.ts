import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  images: {
    // srcset candidate widths for ALL next/image usage, including the custom
    // Sanity loader: exact canvas size (1376) and retina (2752) + standards.
    deviceSizes: [640, 750, 828, 1080, 1200, 1376, 1920, 2048, 2752, 3840],
    // Only applies to /_next/image (default loader). Sanity images bypass it
    // via the custom loader in sanity-image.tsx and rely on cdn.sanity.io's
    // own immutable caching instead.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow Sanity CDN and Mux thumbnails for next/image
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
}

export default nextConfig
