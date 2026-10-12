import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only enforce static export during build/export for Netlify; in dev mode, keep dynamic SSR so dynamic routes work
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
