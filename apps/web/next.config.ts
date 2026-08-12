import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  images: {
    // srcset candidate widths for ALL next/image usage, including the custom
    // Sanity loader: exact canvas size (1376) and retina (2752) + standards.
    deviceSizes: [640, 750, 828, 1080, 1200, 1376, 1920, 2048, 2752, 3840],
    // Exact 1× and 2× candidates for fixed-size UI imagery. AvatarImage uses
    // 32/64px in the header, 36/72px in the menu, and 112/224px in the editor.
    imageSizes: [16, 24, 32, 36, 48, 56, 64, 72, 96, 112, 128, 192, 224, 256, 384],
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
