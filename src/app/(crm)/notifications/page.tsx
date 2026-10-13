'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/features/notifications/hooks/useNotifications';
import { Bell, CheckCheck, Check, Clock, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch, isFetching } = useNotifications({
    page,
    limit,
    unreadOnly,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsRead.mutateAsync();
      toast.success(`Marked ${res.count} notifications as read`);
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const notifications = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Notifications"
          description="Stay updated with system events, contact inquiries, and alert activity."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending || pagination?.total === 0}
            className="flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-green-600" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            !unreadOnly
              ? 'bg-[var(--color-metro-navy)] text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            unreadOnly
              ? 'bg-[var(--color-metro-navy)] text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Unread Only
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500 space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-metro-navy)]" />
          <p className="text-sm">Loading notifications...</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">Failed to load notifications</h3>
            <p className="text-sm text-gray-500 mt-1">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(error as any)?.response?.data?.error?.message ??
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                (error as any)?.message ??
                'An unexpected error occurred.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-medium text-gray-900">
            {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {unreadOnly
              ? 'You have caught up with all your unread notifications.'
              : 'When system events or contact form submissions arrive, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {notifications.map((notification) => {
              const isUnread = !notification.readAt;
              return (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                    isUnread ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUnread
                          ? 'bg-[var(--color-metro-navy)] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {isUnread && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Unread
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line break-words">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsRead.isPending}
                      className="text-gray-500 hover:text-gray-900 shrink-0 text-xs flex items-center gap-1"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark read</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
