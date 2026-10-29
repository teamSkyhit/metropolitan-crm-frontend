/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboard.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('dashboardService.getDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and normalizes data from dedicated /dashboard/summary and /dashboard/recent-enquiries endpoints', async () => {
    const mockSummary = {
      totalEnquiries: 42,
      unassigned: 5,
      new: 10,
      assigned: 15,
      contacted: 8,
      quotationSent: 5,
      negotiation: 2,
      closedWon: 1,
      closedLost: 1,
    };

    const mockRecent = [
      {
        id: 'enq-1',
        name: 'John Doe',
        company: 'Acme Corp',
        status: 'NEW',
        assignedTo: null,
        createdAt: '2026-10-29T10:00:00.000Z',
      },
    ];

    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/dashboard/summary') {
        return Promise.resolve({ data: { success: true, data: mockSummary } } as any);
      }
      if (url === '/dashboard/recent-enquiries') {
        return Promise.resolve({ data: { success: true, data: mockRecent } } as any);
      }
      return Promise.reject(new Error(`Unexpected url ${url}`));
    });

    const result = await dashboardService.getDashboardData(10);

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/summary');
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/recent-enquiries', {
      params: { limit: 10 },
    });

    expect(result.counts).toEqual({
      total: 42,
      new: 10,
      assigned: 15,
      contacted: 8,
      quotationSent: 5,
      negotiation: 2,
      closedWon: 1,
      closedLost: 1,
    });
    expect(result.recentEnquiries).toHaveLength(1);
    expect(result.recentEnquiries[0].id).toBe('enq-1');
  });

  it('falls back to legacy /enquiries/dashboard if dedicated routes are unavailable (e.g. 404)', async () => {
    const mockLegacyDashboard = {
      counts: {
        total: 12,
        new: 3,
        assigned: 4,
        contacted: 2,
        quotationSent: 1,
        negotiation: 1,
        closedWon: 1,
        closedLost: 0,
      },
      recentEnquiries: [
        {
          id: 'legacy-1',
          name: 'Jane Smith',
          company: 'Globex',
          status: 'ASSIGNED',
          assignedTo: { id: 'usr-1', name: 'Sales Rep' },
          createdAt: '2026-10-28T12:00:00.000Z',
        },
      ],
    };

    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/dashboard/summary' || url === '/dashboard/recent-enquiries') {
        return Promise.reject({ response: { status: 404 } });
      }
      if (url === '/enquiries/dashboard') {
        return Promise.resolve({ data: { success: true, data: mockLegacyDashboard } } as any);
      }
      return Promise.reject(new Error(`Unexpected url ${url}`));
    });

    const result = await dashboardService.getDashboardData(10);

    expect(apiClient.get).toHaveBeenCalledWith('/enquiries/dashboard', {
      params: { limit: 10 },
    });
    expect(result).toEqual(mockLegacyDashboard);
  });

  it('propagates 403 Forbidden errors without swallowing or masking them', async () => {
    vi.mocked(apiClient.get).mockImplementation(() =>
      Promise.reject({
        response: { status: 403, data: { success: false, error: { code: 'FORBIDDEN' } } },
      })
    );

    await expect(dashboardService.getDashboardData(10)).rejects.toMatchObject({
      response: { status: 403 },
    });
  });
});
