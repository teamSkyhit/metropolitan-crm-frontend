export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  IS_DEV: process.env.NODE_ENV === 'development',
};
