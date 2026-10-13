export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationListResponse {
  success: boolean;
  data: NotificationItem[];
  meta: {
    pagination: NotificationPagination;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface ReadAllResponse {
  count: number;
}
