"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import EmptyState from "@/components/common/EmptyState";
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
  IoPaperPlane, 
  IoEye,
  IoGrid, 
  IoList,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTime,
  IoWallet,
  IoCalendar,
  IoBusiness
} from "react-icons/io5";

export default function PayoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchPayouts = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      // Add accountId parameter - using 'default' as a fallback
      params.append('accountId', 'default');
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);
      
      const url = `http://localhost:3001/api/v1/payouts${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payouts API error:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Failed to fetch payouts'}`);
      }
      
      const data = await response.json();
      let list = data.data || (Array.isArray(data) ? data : []);
      
      // Client-side filtering for multiple properties if search is present
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        list = list.filter((payout: any) => 
          payout.id?.toLowerCase().includes(searchLower) ||
          payout.description?.toLowerCase().includes(searchLower) ||
          payout.status?.toLowerCase().includes(searchLower) ||
          payout.amount?.toString().includes(searchLower)
        );
      }
      
      setPayouts(list);
      setTotalCount(list.length);
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
      setPayouts([]);
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
    fetchPayouts();
  }, [token, search, sort, year, month]);

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid', icon: IoCheckmarkCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: IoTime },
      in_transit: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Transit', icon: IoPaperPlane },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed', icon: IoCloseCircle },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Canceled', icon: IoCloseCircle }
    } as const;
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const columns = [
    { 
      key: "id", 
      label: "Payout ID", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm">
          {row.id ? row.id.slice(-8) : 'N/A'}
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
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.status || 'pending')
    },
    { 
      key: "arrival_date", 
      label: "Arrival Date", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.arrival_date ? new Date(row.arrival_date * 1000).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: "created", 
      label: "Created", 
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
          ariaLabel="View payout details"
          leftIcon={<IoEye className="w-3 h-3" />}
        />
      )
    }
  ];

  if (loading) return <LoadingState message="Loading payouts..." />;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
          {/* Header */}
          <DashboardHeader
            title="Payouts"
            description="Track your payouts and bank transfers"
            icon={IoPaperPlane}
            stats={[
              {
                label: "Total Payouts",
                value: payouts.length.toString(),
                change: "+12.3%",
                trend: "up"
              },
              {
                label: "Paid",
                value: payouts.filter((p: any) => p.status === 'paid').length.toString(),
                change: "+8.7%",
                trend: "up"
              },
              {
                label: "Total Amount",
                value: `$${payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}`,
                change: "+15.2%",
                trend: "up"
              }
            ]}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Paid Out"
              value={`$${payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}`}
              change="+15.2%"
              trend="up"
              icon={IoWallet}
              gradient="revenue"
            />
            <StatCard
              title="Paid"
              value={payouts.filter((p: any) => p.status === 'paid').length}
              change="+8.7%"
              trend="up"
              icon={IoCheckmarkCircle}
              gradient="success"
            />
            <StatCard
              title="In Transit"
              value={payouts.filter((p: any) => p.status === 'in_transit').length}
              change="+2.1%"
              trend="up"
              icon={IoPaperPlane}
              gradient="default"
            />
            <StatCard
              title="Failed"
              value={payouts.filter((p: any) => ['failed', 'canceled'].includes(p.status)).length}
              change="-1.2%"
              trend="down"
              icon={IoCloseCircle}
              gradient="payments"
            />
          </div>

          {/* Payouts Table/Card View */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Payout Transactions</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {totalCount} total payouts found
                  </CardDescription>
                </div>
                {/* Filters and Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                  {/* Filters on Left */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
                    <Input
                      placeholder="Search by ID, description, or status..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-72"
                    />
                    <Select
                      options={[
                        { value: "", label: "Sort by..." },
                        { value: "created:desc", label: "Newest First" },
                        { value: "created:asc", label: "Oldest First" },
                        { value: "amount:desc", label: "Amount (High to Low)" },
                        { value: "amount:asc", label: "Amount (Low to High)" },
                        { value: "arrival_date:desc", label: "Arrival Date (Latest)" },
                        { value: "arrival_date:asc", label: "Arrival Date (Earliest)" }
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
                payouts.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No payouts match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {payouts.map((payout: any, index) => (
                      <motion.div
                        key={payout.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                      <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-5">
                          {/* Header with Status Badge and Amount */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getStatusBadge(payout.status)}
                              <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                ID: {payout.id ? payout.id.slice(-12) : 'N/A'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                <AmountDisplay amount={payout.amount} currency={payout.currency} />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                                {payout.currency || 'USD'}
                              </div>
                            </div>
                          </div>

                          {/* Payout Info */}
                          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                <IoBusiness className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                  {payout.description || 'Bank Transfer'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {payout.type === 'bank_account' ? 'Bank Account' : payout.type || 'Standard'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payout Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <IoCalendar className="w-3 h-3" />
                                Arrival Date
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {payout.arrival_date ? new Date(payout.arrival_date * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                }) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Created</span>
                              <span className="text-gray-900 dark:text-white">
                                {new Date(payout.created * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Status</span>
                              <span className="text-gray-900 dark:text-white capitalize font-medium">
                                {payout.status?.replace('_', ' ') || 'Pending'}
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
                    columns={columns}
                    data={payouts}
                    loading={loading}
                    emptyMessage="No payouts found"
                    striped
                    hoverable
                    onSort={handleSortChange}
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