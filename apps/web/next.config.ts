import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ensure Next/Turbopack transpiles the internal UI package from the monorepo
  transpilePackages: ['@maicle/ui'],
  images: {
    // Allow Sanity CDN and Mux thumbnails for next/image
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
}

export default nextConfig
