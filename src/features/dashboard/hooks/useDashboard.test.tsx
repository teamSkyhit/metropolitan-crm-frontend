import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardQuery } from './useDashboard';
import { dashboardService } from '../dashboard.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { ROLES } from '@/lib/constants/roles';

vi.mock('../dashboard.service', () => ({
  dashboardService: {
    getDashboardData: vi.fn(),
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

describe('useDashboardQuery integration & role execution tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUPER_ADMIN: dashboard query executes and returns data successfully', async () => {
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

    const mockData = {
      counts: {
        total: 10,
        new: 2,
        assigned: 3,
        contacted: 2,
        quotationSent: 1,
        negotiation: 1,
        closedWon: 1,
        closedLost: 0,
      },
      recentEnquiries: [],
    };

    vi.mocked(dashboardService.getDashboardData).mockResolvedValue(mockData);

    const { result } = renderHook(() => useDashboardQuery(10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(dashboardService.getDashboardData).toHaveBeenCalledWith(10);
    expect(result.current.data).toEqual(mockData);
  });

  it('SUPER_ADMIN: dashboard query executes and returns data successfully', async () => {
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

    const mockData = {
      counts: {
        total: 25,
        new: 5,
        assigned: 8,
        contacted: 4,
        quotationSent: 3,
        negotiation: 2,
        closedWon: 2,
        closedLost: 1,
      },
      recentEnquiries: [],
    };

    vi.mocked(dashboardService.getDashboardData).mockResolvedValue(mockData);

    const { result } = renderHook(() => useDashboardQuery(10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(dashboardService.getDashboardData).toHaveBeenCalledWith(10);
    expect(result.current.data?.counts.total).toBe(25);
  });

  it('CRM_USER: dashboard query MUST NOT execute (enabled = false)', async () => {
    useAuthStore.setState({
      user: {
        id: 'crm-user-1',
        name: 'CRM Agent',
        email: 'crm@example.com',
        role: ROLES.CRM_USER,
      },
      role: ROLES.CRM_USER,
      isAuthenticated: true,
      isInitializing: false,
    });

    const { result } = renderHook(() => useDashboardQuery(10), { wrapper: createWrapper() });

    // Since enabled is false for CRM_USER, status should remain pending/idle and function never called
    expect(dashboardService.getDashboardData).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('Dashboard API failure: reports isError and preserves retry capability', async () => {
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

    vi.mocked(dashboardService.getDashboardData).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboardQuery(10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
