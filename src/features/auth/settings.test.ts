import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService settings operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls /auth/change-password with correct payload', async () => {
    const mockSession = {
      user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'SUPER_ADMIN' as const },
      tokens: {
        accessToken: 'at',
        refreshToken: 'rt',
        accessTokenExpiresIn: 900,
        refreshTokenExpiresAt: '2026-10-10',
      },
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: mockSession } });

    const result = await authService.changePassword({
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    });
    expect(result).toEqual(mockSession);
  });

  it('calls /auth/logout-all', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await authService.logoutAll();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout-all');
  });
});
