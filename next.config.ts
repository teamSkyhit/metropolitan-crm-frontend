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
    // If NEXT_PUBLIC_API_URL happens to be a relative path like '/api/v1', we fallback to Railway backend
    const baseUrl = backendUrl.startsWith('http')
      ? backendUrl
      : 'https://metropolitan-staging-1d6f.up.railway.app';

    // Strip trailing slash or trailing /api/v1 if it exists so we can safely append /api/v1
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
