"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TicketIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SidebarLayoutProps {
  readonly children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  gradient?: string;
}

interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation: NavItem[] = [
    {
      name: 'Setup Stripe',
      href: '/admin/initsetup',
      icon: SparklesIcon,
      badge: 'Setup',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: CreditCardIcon,
      badge: 'New',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Payouts',
      href: '/admin/payouts',
      icon: CurrencyDollarIcon,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      name: 'Refunds',
      href: '/admin/refunds',
      icon: CreditCardIcon,
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      name: 'Disputes',
      href: '/admin/disputes',
      icon: ShieldCheckIcon,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: UserGroupIcon,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CurrencyDollarIcon,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Invoices',
      href: '/admin/invoices',
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: TicketIcon,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Coupons',
      href: '/admin/coupons',
      icon: DocumentTextIcon,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Balance',
      href: '/admin/balance',
      icon: CurrencyDollarIcon,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserCircleIcon,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'Roles',
      href: '/admin/roles',
      icon: ShieldCheckIcon,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      name: 'Permissions',
      href: '/admin/permissions',
      icon: ShieldCheckIcon,
      gradient: 'from-fuchsia-500 to-purple-500'
    },
    {
      name: 'Accounts',
      href: '/admin/accounts',
      icon: UserCircleIcon,
      gradient: 'from-slate-500 to-gray-500'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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
    if (!token) return;
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await api.getNotifications(token, 1, 10, false);
      const items = Array.isArray(response?.data) ? response.data : [];
      setNotifications(items);
    } catch (error) {
      setNotificationsError('Unable to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (token && !notification.isRead) {
      try {
        await api.updateNotificationRead(token, notification.id, true);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      } catch (error) {
        setNotificationsError('Unable to update notification.');
      }
    }
    setNotificationOpen(false);
  };

  useEffect(() => {
    if (!token) return;
    loadNotifications();
    const interval = window.setInterval(() => {
      loadNotifications();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    // Clear Zustand auth state
    logout();
    // Clear any lingering localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // Redirect to login
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - Only on small screens */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-700 shadow-md w-72 lg:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-16 bottom-0 left-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 relative z-10 ${sidebarCollapsed ? 'lg:ml-12' : 'lg:ml-48'}`}>
        {/* Top Navigation - Overlaps sidebar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 transition-all duration-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side - Logo and Menu buttons */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
                  Stripe Manager
                </span>
              </div>
              
              {/* Mobile Menu Toggle Button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="neutral"
                  style="soft"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Bars3Icon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right side items - Notification and Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="neutral" 
                  style="soft" 
                  size="sm" 
                  className="relative"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setNotificationOpen(false)}
                      />
                      
                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Notifications
                            </h3>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {unreadCount} unread
                            </span>
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                          {notificationsLoading ? (
                            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                              Loading notifications...
                            </div>
                          ) : notificationsError ? (
                            <div className="p-6 text-center text-sm text-red-500">
                              {notificationsError}
                            </div>
                          ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Icon */}
                                  <div className={`p-2 rounded-lg ${
                                    notification.type === 'sync_success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                    notification.type === 'sync_failure' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                    notification.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                    notification.type === 'customer' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                    notification.type === 'subscription' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}>
                                    {(() => {
                                      const Icon = getNotificationIcon(notification.type);
                                      return <Icon className="h-4 w-4" />;
                                    })()}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
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
                                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <div className="text-slate-400 dark:text-slate-500">
                                <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <button
                            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            onClick={() => {
                              setNotificationOpen(false);
                              router.push('/admin/notifications');
                            }}
                            type="button"
                          >
                            Show all notifications
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Minimal padding */}
        <main className="flex-1 pt-20">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <div className="h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Sidebar Header with Collapse Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Menu</h2>
          )}
          {/* Desktop Collapse Button */}
          <Button
            variant="neutral"
            style="soft"
            size="sm"
            onClick={() => isMobile ? setSidebarOpen(false) : setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
          >
            {isMobile ? (
              <XMarkIcon className="h-4 w-4" />
            ) : sidebarCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-1"
              >
                <Button
                  variant={isActive ? "success" : "neutral"}
                  style={isActive ? "solid" : "soft"}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start group transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                  } ${sidebarCollapsed ? 'px-3 py-2' : 'px-3 py-2'}`}
                  leftIcon={
                    <item.icon className={`h-4 w-4 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`} />
                  }
                >
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-left text-sm">{item.name}</span>
                      {item.badge && (
                        <Badge variant="success" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
                {sidebarCollapsed && (
                  <div className="text-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500 transition-colors duration-300"></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'A'}
              </div>
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            </div>
          )}
          
          <Button
            variant="delete"
            style="soft"
            onClick={handleLogout}
            className={`w-full justify-center gap-2 transition-all duration-300 ${
              sidebarCollapsed ? 'px-3 py-2' : 'px-4 py-2'
            }`}
          >
            <ArrowRightOnRectangleIcon className={`h-4 w-4 transition-all duration-300 ${
              sidebarCollapsed ? 'h-4 w-4' : 'h-4 w-4'
            }`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    );
  }
}
