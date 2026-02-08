'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  BellIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TicketIcon,
  UserGroupIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  data: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function NotificationsPage() {
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'sync_success':
        return 'Sync completed';
      case 'sync_failure':
        return 'Sync failed';
      case 'payment':
        return 'New payment';
      case 'customer':
        return 'New customer';
      case 'subscription':
        return 'Subscription update';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sync_success':
        return ShieldCheckIcon;
      case 'sync_failure':
        return XMarkIcon;
      case 'payment':
        return CurrencyDollarIcon;
      case 'customer':
        return UserGroupIcon;
      case 'subscription':
        return TicketIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const formatNotificationTime = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Just now';
    return date.toLocaleString();
  };

  const loadNotifications = async () => {
    if (!token) {
      setError('You must be logged in to view notifications.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = (await api.getNotifications(token, page, pageSize, false)) as NotificationResponse;
      const items = Array.isArray(response?.data) ? response.data : [];
      setNotifications(items);
    } catch (err) {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Latest updates and system messages.
          </p>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Page {page}
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading notifications...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No notifications yet.
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-4 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'sync_success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    notification.type === 'sync_failure' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    notification.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                    notification.type === 'customer' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    notification.type === 'subscription' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {getNotificationTitle(notification.type)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
