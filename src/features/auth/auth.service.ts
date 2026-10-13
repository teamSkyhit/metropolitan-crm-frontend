import { apiClient } from '@/lib/api/client';
import { LoginCredentials, AuthSession, AuthTokens, ApiResponse } from './types';
import { User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth/token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', credentials);
    return response.data.data;
  },

  async refresh(): Promise<AuthTokens> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>(
      '/auth/change-password',
      payload
    );
    return response.data.data;
  },

  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },
};
