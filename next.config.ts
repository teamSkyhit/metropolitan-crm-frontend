import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // rewrites are incompatible with static export — re-enable when deploying with a Node server
  // async rewrites() { ... },
};

export default nextConfig;
