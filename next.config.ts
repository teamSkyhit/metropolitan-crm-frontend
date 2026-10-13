import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://metropolitan-staging-1d6f.up.railway.app';
    const baseUrl = backendUrl.startsWith('http')
      ? backendUrl
      : 'https://metropolitan-staging-1d6f.up.railway.app';

    const cleanBaseUrl = baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanBaseUrl}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${cleanBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
