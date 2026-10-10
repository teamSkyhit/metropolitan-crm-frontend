import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../notifications.service';
import { NotificationQuery } from '../types';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (query?: NotificationQuery) => [...NOTIFICATION_KEYS.lists(), query] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unread-count'] as const,
};

export const useNotifications = (query?: NotificationQuery) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(query),
    queryFn: () => notificationsService.getNotifications(query),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30s
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};
