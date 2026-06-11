import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Exact canvas size (1376) and retina (2752) + standards
    deviceSizes: [640, 750, 828, 1080, 1200, 1376, 1920, 2048, 2752, 3840],
    // Sanity URLs are immutable per content version; cache aggressively at the edge.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow Sanity CDN and Mux thumbnails for next/image
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
}

export default nextConfig
