"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import EmptyState from "@/components/common/EmptyState";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import DaisyTable from "@/components/ui/Table";
import { motion } from "framer-motion";
import Pagination from "@/components/ui/Pagination";
import DashboardHeader from "@/components/ui/DashboardHeader";
import StatCard from "@/components/ui/StatCard";
import AuthGuard from "@/components/auth/AuthGuard";
import { 
  IoRefresh, 
  IoGrid, 
  IoList,
  IoCheckmarkCircle,
  IoTime,
  IoCloseCircle,
  IoAlertCircle,
  IoPause,
  IoPlay,
  IoEye,
  IoRepeat
} from "react-icons/io5";

export default function SubscriptionsPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchSubscriptions = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);
      
      const url = `http://localhost:3001/api/v1/subscriptions${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const subsArray = data?.data || [];
        setSubscriptions(subsArray);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchSubscriptions();
  }, [token, search, sort, page, year, month]);

  const columns = [
    { 
      key: "id", 
      label: "ID", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm">{row.id ? row.id.slice(-8) : 'N/A'}</span>
      )
    },
    { 
      key: "customer", 
      label: "Customer", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium text-gray-900">{row.customer || 'Unknown'}</span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.status)
    },
    { 
      key: "plan", 
      label: "Plan", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium">
          <AmountDisplay amount={row.plan?.amount || 0} currency={row.plan?.currency || 'usd'} />
          <span className="text-gray-500 text-xs ml-1">/{row.plan?.interval}</span>
        </span>
      )
    },
    { 
      key: "current_period_end", 
      label: "Renews", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.current_period_end ? new Date(row.current_period_end * 1000).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (value: any, row: any) => (
        <Button size="sm" variant="view">
          <IoEye className="w-3 h-3" />
        </Button>
      )
    }
  ];

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active', icon: IoCheckmarkCircle },
      trialing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trialing', icon: IoTime },
      past_due: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Past Due', icon: IoAlertCircle },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Canceled', icon: IoCloseCircle },
      unpaid: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unpaid', icon: IoAlertCircle },
    } as const;
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const statsCards = [
    {
      title: "Total Subscriptions",
      value: subscriptions.length,
      icon: IoRepeat,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    },
    {
      title: "Active",
      value: subscriptions.filter(s => s.status === 'active').length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "from-emerald-600 to-teal-600"
    },
    {
      title: "Canceled",
      value: subscriptions.filter(s => s.status === 'canceled').length,
      icon: IoCloseCircle,
      gradient: "from-rose-500 via-pink-500 to-red-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "from-rose-600 to-pink-600"
    }
  ];

  if (loading) return <LoadingState message="Loading subscriptions..." />;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
        {/* Header */}
          <DashboardHeader
            title="Subscriptions"
            description="Manage recurring billing and plans"
            icon={IoRepeat}
            stats={[
              {
                label: "Total Subscriptions",
                value: subscriptions.length.toString(),
                change: "+8.2%",
                trend: "up"
              },
              {
                label: "Active Plans",
                value: subscriptions.filter(s => s.status === 'active').length.toString(),
                change: "+5.1%",
                trend: "up"
              }
            ]}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Subscriptions"
              value={subscriptions.length}
              change="+8.2%"
              trend="up"
              icon={IoRepeat}
              gradient="revenue"
            />
            <StatCard
              title="Active Plans"
              value={subscriptions.filter(s => s.status === 'active').length}
              change="+5.1%"
              trend="up"
              icon={IoCheckmarkCircle}
              gradient="success"
            />
            <StatCard
              title="Trialing"
              value={subscriptions.filter(s => s.status === 'trialing').length}
              change="+2.3%"
              trend="up"
              icon={IoTime}
              gradient="customers"
            />
          </div>

          {/* Subscriptions List */}
          <Card variant="elevated">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
                {/* Filters on Left */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                  <Input
                    label="Search Subscriptions"
                    placeholder="Search by customer or plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select
                    options={[
                      { value: "created:desc", label: "Newest" },
                      { value: "created:asc", label: "Oldest" },
                      { value: "customer:asc", label: "Customer (A-Z)" },
                      { value: "customer:desc", label: "Customer (Z-A)" }
                    ]}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full sm:w-32"
                  />
                </div>
                {/* View Mode on Right */}
                <div className="flex items-end justify-end">
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-fit">
                    <button
                      onClick={() => setView('card')}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        view === 'card'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                      }`}
                    >
                      <IoGrid className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setView('table')}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        view === 'table'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                      }`}
                    >
                      <IoList className="w-4 h-4 mr-1" />
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {view === 'card' && (
                subscriptions.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No subscriptions match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscriptions.map((subscription, index) => (
                    <motion.div
                      key={subscription.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card variant="elevated" className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{subscription.customer || 'Unknown Customer'}</h3>
                            <p className="text-sm text-gray-500">{subscription.plan?.name || 'Unknown Plan'}</p>
                          </div>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-medium">
                              <AmountDisplay amount={subscription.plan?.amount || 0} currency={subscription.plan?.currency || 'usd'} />
                              <span className="text-gray-500 text-xs ml-1">/{subscription.plan?.interval}</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span className="font-medium">
                              {subscription.created ? new Date(subscription.created).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          <Button 
                            variant="view" 
                            style="soft" 
                            size="sm" 
                            iconOnly
                            ariaLabel="View subscription details"
                            leftIcon={<IoEye className="w-3 h-3" />}
                          />
                        </div>
                      </Card>
                    </motion.div>
                    ))}
                  </div>
                )
              )}
              {view === 'table' && (
                <DaisyTable
                  columns={columns}
                  data={subscriptions}
                  loading={loading}
                  emptyMessage="No subscriptions found"
                  striped
                  hoverable
                  onSort={handleSortChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(subscriptions.length / 10)}
              onPageChange={setPage}
            />
        </div>
      </div>
    </AuthGuard>
  );
}