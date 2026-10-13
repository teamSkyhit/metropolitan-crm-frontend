export const env = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:5000/api/v1'
      : '/api/v1'),
  IS_DEV: process.env.NODE_ENV === 'development',
};
