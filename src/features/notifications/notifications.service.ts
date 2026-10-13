import { apiClient } from '@/lib/api/client';
import {
  NotificationItem,
  NotificationQuery,
  NotificationListResponse,
  UnreadCountResponse,
  ReadAllResponse,
} from './types';

const basePath = '/notifications';

export const notificationsService = {
  getNotifications: async (query?: NotificationQuery): Promise<NotificationListResponse> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (typeof query?.unreadOnly === 'boolean') {
      params.unreadOnly = query.unreadOnly ? 'true' : 'false';
    }
    const res = await apiClient.get<NotificationListResponse>(basePath, { params });
    return res.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await apiClient.get<{ success: boolean; data: UnreadCountResponse }>(
      `${basePath}/unread-count`
    );
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.patch<{ success: boolean; data: NotificationItem }>(
      `${basePath}/${id}/read`
    );
    return res.data.data;
  },

  markAllAsRead: async (): Promise<ReadAllResponse> => {
    const res = await apiClient.patch<{ success: boolean; data: ReadAllResponse }>(
      `${basePath}/read-all`
    );
    return res.data.data;
  },
};
