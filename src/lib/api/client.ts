import axios from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Placeholder for auth token injection
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Placeholder for global error handling (e.g., token refresh on 401)
    return Promise.reject(error);
  }
);
