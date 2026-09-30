import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000';
    // If NEXT_PUBLIC_API_URL happens to be a relative path like '/api/v1', we fallback to localhost for safety
    const baseUrl = backendUrl.startsWith('http') ? backendUrl : 'http://localhost:5000';

    // Strip trailing slash or trailing /api/v1 if it exists so we can safely append /api/v1
    const cleanBaseUrl = baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
