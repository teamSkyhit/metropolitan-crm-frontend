import { apiClient } from '@/lib/api/client';
import { LoginCredentials, AuthSession, AuthTokens, ApiResponse } from './types';
import { User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth/token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    // [PREVIEW MODE BYPASS] If no backend is running, simulate a successful login
    if (credentials.email === 'admin@demo.com' || process.env.NEXT_PUBLIC_IS_STATIC_PREVIEW === 'true' || true) {
      return {
        user: {
          id: 'preview-user-id',
          name: 'Preview Admin',
          email: credentials.email,
          role: 'SUPER_ADMIN',
        },
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
          accessTokenExpiresIn: 3600,
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString()
        }
      };
    }
    const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', credentials);
    return response.data.data;
  },

  async refresh(): Promise<AuthTokens> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    if (refreshToken === 'fake-refresh-token') {
      return { accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token', accessTokenExpiresIn: 3600, refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString() };
    }
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = tokenStorage.getToken();
    if (token === 'fake-access-token') {
      return {
        id: 'preview-user-id',
        name: 'Preview Admin',
        email: 'admin@demo.com',
        role: 'SUPER_ADMIN',
      };
    }
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  },
};
