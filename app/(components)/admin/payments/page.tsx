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
  IoCash, 
  IoEye,
  IoGrid, 
  IoList,
  IoTrendingUp,
  IoTime,
  IoCloseCircle,
  IoCheckmarkCircle,
  IoCard
} from "react-icons/io5";

export default function PaymentsPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('amount:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "amount", direction: "descending" });

  const fetchPayments = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const data = await api.getPayments(token, page, pageSize, search, sort, year, month);
      const list = data.data || [];
      setPayments(list);
      setTotalCount(list.length);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchPayments();
  }, [token, search, sort, year, month]);

  const columns = [
    { 
      key: "paymentId", 
      label: "Payment ID", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm">
          {row.paymentIntentId ? row.paymentIntentId.slice(-8) : 'N/A'}
        </span>
      )
    },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium">
          <AmountDisplay amount={row.amount || 0} currency={row.currency || 'usd'} />
        </span>
      )
    },
    { 
      key: "customer", 
      label: "Customer", 
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName || 'Unknown'}</div>
          <div className="text-sm text-gray-500">{row.customerEmail || ''}</div>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.status || 'pending')
    },
    { 
      key: "created", 
      label: "Date", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.created ? new Date(row.created * 1000).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (value: any, row: any) => (
        <Button 
          variant="view" 
          style="soft" 
          size="sm" 
          iconOnly
          ariaLabel="View payment details"
          leftIcon={<IoEye className="w-3 h-3" />}
        />
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
      succeeded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Succeeded', icon: IoCheckmarkCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: IoTime },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: IoCloseCircle },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Canceled', icon: IoCloseCircle },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing', icon: IoTime },
      requires_payment_method: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Requires Payment', icon: IoCard }
    } as const;
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const statsCards = [
    {
      title: "Total Payments",
      value: payments.length,
      icon: IoCash,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-600 to-cyan-600"
    },
    {
      title: "Successful Payments",
      value: payments.filter((p) => p.status === 'succeeded').length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-600 to-green-600"
    },
    {
      title: "Total Amount",
      value: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      icon: IoTrendingUp,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600",
      format: "currency"
    },
    {
      title: "Average Payment",
      value: payments.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length : 0,
      icon: IoCard,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      bgGradient: "from-orange-50 to-amber-50",
      iconBg: "from-orange-600 to-amber-600",
      format: "currency"
    }
  ];

  if (loading) return <LoadingState message="Loading payments..." />;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
          {/* Header */}
          <DashboardHeader
            title="Payments"
            description="Monitor payment transactions and status"
            icon={IoCash}
            stats={[
              {
                label: "Total Payments",
                value: payments.length.toString(),
                change: "+12.3%",
                trend: "up"
              },
              {
                label: "Successful",
                value: payments.filter((p: any) => p.status === 'succeeded').length.toString(),
                change: "+8.7%",
                trend: "up"
              },
              {
                label: "Total Revenue",
                value: `$${payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}`,
                change: "+15.2%",
                trend: "up"
              }
            ]}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}`}
              change="+15.2%"
              trend="up"
              icon={IoTrendingUp}
              gradient="revenue"
            />
            <StatCard
              title="Successful"
              value={payments.filter((p: any) => p.status === 'succeeded').length}
              change="+8.7%"
              trend="up"
              icon={IoCheckmarkCircle}
              gradient="success"
            />
            <StatCard
              title="Pending"
              value={payments.filter((p: any) => ['pending', 'requires_payment_method', 'processing'].includes(p.status)).length}
              change="+2.1%"
              trend="up"
              icon={IoTime}
              gradient="default"
            />
            <StatCard
              title="Failed"
              value={payments.filter((p: any) => ['failed', 'canceled'].includes(p.status)).length}
              change="-1.2%"
              trend="down"
              icon={IoCloseCircle}
              gradient="payments"
            />
          </div>

          {/* Payments Table/Card View */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Payment Transactions</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {totalCount} total payments found
                  </CardDescription>
                </div>
                {/* Filters and Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                  {/* Filters on Left */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
                    <Input
                      placeholder="Search by name, email, ID, or amount..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-72"
                    />
                    <Select
                      options={[
                        { value: "", label: "Sort by..." },
                        { value: "amount:desc", label: "Amount (High to Low)" },
                        { value: "amount:asc", label: "Amount (Low to High)" },
                        { value: "created:desc", label: "Date (Newest)" },
                        { value: "created:asc", label: "Date (Oldest)" }
                      ]}
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full sm:w-52"
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
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {view === 'card' && (
                payments.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No payments match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {payments.map((payment: any, index) => (
                      <motion.div
                        key={payment.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                      <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-5">
                          {/* Header with Status Badge and Amount */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getStatusBadge(payment.status)}
                              <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                ID: {payment.id}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                <AmountDisplay amount={payment.amount} currency={payment.currency} />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                                {payment.currency}
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {payment.customerName ? payment.customerName.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                  {payment.customerName || 'Guest Customer'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {payment.customerEmail || 'No email provided'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Payment Intent</span>
                              <span className="font-mono text-xs text-gray-900 dark:text-white">
                                {payment.paymentIntentId ? payment.paymentIntentId.slice(-12) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Customer Name</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {payment.customerName || 'Guest Customer'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Date Created</span>
                              <span className="text-gray-900 dark:text-white">
                                {new Date(payment.created * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                  })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Mode</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                payment.livemode 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {payment.livemode ? 'Live' : 'Test'}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                              variant="success" 
                              style="soft" 
                              size="sm"
                              className="w-full"
                              leftIcon={<IoEye className="w-4 h-4" />}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
              {view === 'table' && (
                <div className="overflow-x-auto">
                  <DaisyTable
                    columns={[
                      { key: 'id', label: 'ID', render: (id: string) => (
                        <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{id}</span>
                      )},
                      { key: 'paymentIntentId', label: 'Payment Intent', render: (paymentIntentId: string) => (
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {paymentIntentId ? paymentIntentId.slice(-12) : 'N/A'}
                        </span>
                      )},
                      { key: 'amount', label: 'Amount', render: (amount: number, payment: any) => (
                        <div className="font-semibold">
                          <AmountDisplay amount={amount} currency={payment.currency} />
                        </div>
                      )},
                      { key: 'status', label: 'Status', render: (status: string) => getStatusBadge(status) },
                      { key: 'customerName', label: 'Customer', render: (customerName: string, payment: any) => (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{customerName || 'Guest'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {payment.customerEmail || 'No email'}
                          </div>
                        </div>
                      )},
                      { key: 'created', label: 'Date', render: (created: number) => (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(created * 1000).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      )},
                      { key: 'livemode', label: 'Mode', render: (livemode: boolean) => (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          livemode 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {livemode ? 'Live' : 'Test'}
                        </span>
                      )}
                    ]}
                    data={payments}
                    loading={loading}
                    emptyMessage="No payments found"
                    striped
                    hoverable
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={setPage}
            />
          </div>
      </div>
    </AuthGuard>
  );
}