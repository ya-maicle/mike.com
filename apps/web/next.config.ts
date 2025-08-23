import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ensure Next/Turbopack transpiles the internal UI package from the monorepo
  transpilePackages: ['@maicle/ui'],
}

export default nextConfig
