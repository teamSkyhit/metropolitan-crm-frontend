import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from './notifications.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('notificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches notifications with query params', async () => {
    const mockData = {
      success: true,
      data: [],
      meta: {
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await notificationsService.getNotifications({
      page: 1,
      limit: 20,
      unreadOnly: true,
    });

    expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
      params: { page: 1, limit: 20, unreadOnly: 'true' },
    });
    expect(result).toEqual(mockData);
  });

  it('fetches unread count', async () => {
    const mockData = { success: true, data: { count: 5 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

    const result = await notificationsService.getUnreadCount();

    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result).toEqual({ count: 5 });
  });

  it('marks a notification as read', async () => {
    const mockData = { success: true, data: { id: 'test-id', readAt: '2026-10-09T00:00:00Z' } };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockData });

    const result = await notificationsService.markAsRead('test-id');

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/test-id/read');
    expect(result).toEqual(mockData.data);
  });

  it('marks all notifications as read', async () => {
    const mockData = { success: true, data: { count: 3 } };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockData });

    const result = await notificationsService.markAllAsRead();

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all');
    expect(result).toEqual({ count: 3 });
  });
});
