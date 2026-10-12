import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Only enforce static export during build/export for Netlify; in dev mode, keep dynamic SSR so dynamic routes work
  ...(isProd ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  // In development, proxy /uploads/* to the local backend port 5000 so uploaded images display properly
  ...(!isProd
    ? {
        async rewrites() {
          return [
            {
              source: '/uploads/:path*',
              destination: 'http://localhost:5000/uploads/:path*',
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
