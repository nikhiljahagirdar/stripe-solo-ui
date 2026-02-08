"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import EmptyState from "@/components/common/EmptyState";

interface Customer {
  id: number;
  userId: number;
  stripeAccountId: number;
  stripeCustomerId: string;
  email: string;
  name: string;
  liveMode: boolean;
  created: number;
  createdAt: string;
  updatedAt: string;
  totalSpent: number;
}

interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
import { LoadingState, AmountDisplay } from "@/components";
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
  IoPeople, 
  IoEye,
  IoGrid, 
  IoList,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTime,
  IoWallet,
  IoMail,
  IoCalendar
} from "react-icons/io5";

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchCustomers = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const response: CustomersResponse = await api.getCustomersList(token, page, pageSize, search, sort, year, month);
      setCustomers(response.data || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchCustomers();
  }, [token, search, sort, year, month]);

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active', icon: IoCheckmarkCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive', icon: IoCloseCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: IoTime },
      suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended', icon: IoCloseCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const columns = [
    { 
      key: "id", 
      label: "Customer ID", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm">
          {row.stripeCustomerId ? row.stripeCustomerId.slice(-8) : row.id}
        </span>
      )
    },
    { 
      key: "name", 
      label: "Customer", 
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{row.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.status || 'active')
    },
    { 
      key: "totalSpent", 
      label: "Total Spent", 
      sortable: true,
      render: (value: any, row: Customer) => (
        <span className="font-medium">
          ${(row.totalSpent || 0).toFixed(2)}
        </span>
      )
    },
    { 
      key: "created", 
      label: "Date", 
      sortable: true,
      render: (value: any, row: Customer) => (
        <span className="text-sm text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
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
          ariaLabel="View customer details"
          leftIcon={<IoEye className="w-3 h-3" />}
        />
      )
    }
  ];

  if (loading) return <LoadingState message="Loading customers..." />;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
          {/* Header */}
          <DashboardHeader
            title="Customers"
            description="Manage your customer base and track their activity"
            icon={IoPeople}
            stats={[
              {
                label: "Total Customers",
                value: customers.length.toString(),
                change: "+12.3%",
                trend: "up"
              },
              {
                label: "Active",
                value: customers.filter((c: any) => c.status === 'active').length.toString(),
                change: "+8.7%",
                trend: "up"
              },
              {
                label: "Total Lifetime Value",
                value: `$${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(2)}`,
                change: "+15.2%",
                trend: "up"
              }
            ]}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Customers"
              value={customers.length}
              change="+12.3%"
              trend="up"
              icon={IoPeople}
              gradient="customers"
            />
            <StatCard
              title="Active"
              value={customers.filter((c: any) => c.status === 'active').length}
              change="+8.7%"
              trend="up"
              icon={IoCheckmarkCircle}
              gradient="success"
            />
            <StatCard
              title="Pending"
              value={customers.filter((c: any) => c.status === 'pending').length}
              change="+2.1%"
              trend="up"
              icon={IoTime}
              gradient="default"
            />
            <StatCard
              title="Lifetime Value"
              value={`$${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(2)}`}
              change="+15.2%"
              trend="up"
              icon={IoWallet}
              gradient="revenue"
            />
          </div>

          {/* Customer List */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Customer Directory</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {totalCount} total customers found
                  </CardDescription>
                </div>
                {/* Filters and Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                  <Input
                    placeholder="Search by name, email, ID, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-72"
                  />
                  <Select
                    options={[
                      { value: "created:desc", label: "Newest First" },
                      { value: "created:asc", label: "Oldest First" },
                      { value: "name:asc", label: "Name (A-Z)" },
                      { value: "name:desc", label: "Name (Z-A)" },
                      { value: "totalSpent:desc", label: "Highest Spender" },
                      { value: "totalSpent:asc", label: "Lowest Spender" }
                    ]}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full sm:w-52"
                  />
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
                customers.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No customers match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {customers.map((customer: any, index) => (
                      <motion.div
                        key={customer.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                      <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-5">
                          {/* Header with Status Badge and Total Spent */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getStatusBadge(customer.status)}
                              <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                ID: {customer.id}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                                Total Spent
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                <AmountDisplay amount={customer.totalSpent} currency="usd" />
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                  {customer.name || 'Unknown Customer'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                                  <IoMail className="w-3 h-3" />
                                  {customer.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Customer Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Customer ID</span>
                              <span className="font-mono text-xs text-gray-900 dark:text-white">
                                {customer.stripeCustomerId ? customer.stripeCustomerId.slice(-12) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Phone</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {customer.phone || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <IoCalendar className="w-3 h-3" />
                                Joined
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {new Date(customer.created * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                              <span className="text-gray-900 dark:text-white capitalize font-medium">
                                {customer.status || 'Active'}
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
                    data={customers}
                    loading={loading}
                    emptyMessage="No customers found"
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