import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUnreadCount } from './useNotifications';
import { notificationsService } from '../notifications.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { ROLES } from '@/lib/constants/roles';

vi.mock('../notifications.service', () => ({
  notificationsService: {
    getUnreadCount: vi.fn(),
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

describe('useUnreadCount role-gating & execution tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUPER_ADMIN: executes unread count query and returns data', async () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: ROLES.SUPER_ADMIN,
      },
      role: ROLES.SUPER_ADMIN,
      isAuthenticated: true,
      isInitializing: false,
    });

    vi.mocked(notificationsService.getUnreadCount).mockResolvedValueOnce({ count: 4 });

    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual({ count: 4 });
    });

    expect(notificationsService.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('CRM_USER: disabled query does not poll or fetch unread count', () => {
    useAuthStore.setState({
      user: {
        id: 'crm-1',
        name: 'Devaki Damodara',
        email: 'devaki@example.com',
        role: ROLES.CRM_USER,
      },
      role: ROLES.CRM_USER,
      isAuthenticated: true,
      isInitializing: false,
    });

    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });

    expect(notificationsService.getUnreadCount).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });
});
