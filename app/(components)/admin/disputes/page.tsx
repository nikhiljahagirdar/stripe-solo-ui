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
  IoShield, 
  IoEye,
  IoGrid, 
  IoList,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTime,
  IoWarning,
  IoAlertCircle,
  IoCalendar,
  IoDocument
} from "react-icons/io5";

export default function DisputesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchDisputes = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);
      
      const url = `http://localhost:3001/api/v1/disputes${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Disputes API error:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Failed to fetch disputes'}`);
      }
      
      const data = await response.json();
      let list = data.data || (Array.isArray(data) ? data : []);
      
      // Client-side filtering for multiple properties if search is present
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        list = list.filter((dispute: any) => 
          dispute.id?.toLowerCase().includes(searchLower) ||
          dispute.reason?.toLowerCase().includes(searchLower) ||
          dispute.status?.toLowerCase().includes(searchLower) ||
          dispute.amount?.toString().includes(searchLower)
        );
      }
      
      setDisputes(list);
      setTotalCount(list.length);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
      setDisputes([]);
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
    fetchDisputes();
  }, [token, search, sort, year, month]);

  const columns = [
    { 
      key: "id", 
      label: "Dispute ID", 
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
      render: (value: any, row: any) => getStatusBadge(row.status || 'under_review')
    },
    { 
      key: "reason", 
      label: "Reason", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="capitalize text-sm text-gray-700">
          {row.reason ? row.reason.replace(/_/g, ' ') : 'Unknown'}
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
          ariaLabel="View dispute details"
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
      won: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Won', icon: IoCheckmarkCircle },
      lost: { bg: 'bg-red-100', text: 'text-red-700', label: 'Lost', icon: IoCloseCircle },
      needs_response: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Needs Response', icon: IoWarning },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Under Review', icon: IoTime },
      warning_needs_response: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Action Required', icon: IoAlertCircle },
      warning_closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed', icon: IoCloseCircle },
      charge_refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded', icon: IoCheckmarkCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: IoShield };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) return <LoadingState message="Loading disputes..." />;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
          {/* Header */}
          <DashboardHeader
            title="Disputes"
            description="Manage payment disputes and chargebacks"
            icon={IoShield}
            stats={[
              {
                label: "Total Disputes",
                value: disputes.length.toString(),
                change: "+5.2%",
                trend: "up"
              },
              {
                label: "Action Required",
                value: disputes.filter((d: any) => d.status === 'needs_response' || d.status === 'warning_needs_response').length.toString(),
                change: "+3.1%",
                trend: "up"
              },
              {
                label: "Won",
                value: disputes.filter((d: any) => d.status === 'won').length.toString(),
                change: "+10.5%",
                trend: "up"
              }
            ]}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Disputes"
              value={disputes.length}
              change="+5.2%"
              trend="up"
              icon={IoShield}
              gradient="customers"
            />
            <StatCard
              title="Action Required"
              value={disputes.filter((d: any) => d.status === 'needs_response' || d.status === 'warning_needs_response').length}
              change="+3.1%"
              trend="up"
              icon={IoWarning}
              gradient="payments"
            />
            <StatCard
              title="Won"
              value={disputes.filter((d: any) => d.status === 'won').length}
              change="+10.5%"
              trend="up"
              icon={IoCheckmarkCircle}
              gradient="success"
            />
            <StatCard
              title="Under Review"
              value={disputes.filter((d: any) => d.status === 'under_review').length}
              change="+2.1%"
              trend="up"
              icon={IoTime}
              gradient="default"
            />
          </div>

          {/* Disputes Table/Card View */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Dispute Cases</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {totalCount} total disputes found
                  </CardDescription>
                </div>
                {/* Filters and Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                  <Input
                    placeholder="Search by ID, reason, or status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-72"
                  />
                  <Select
                    options={[
                      { value: "created:desc", label: "Newest First" },
                      { value: "created:asc", label: "Oldest First" },
                      { value: "amount:desc", label: "Amount (High to Low)" },
                      { value: "amount:asc", label: "Amount (Low to High)" }
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
                disputes.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No disputes match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {disputes.map((dispute: any, index) => (
                      <motion.div
                        key={dispute.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                      <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-5">
                          {/* Header with Status Badge and Amount */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getStatusBadge(dispute.status)}
                              <div className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                ID: {dispute.id ? dispute.id.slice(-12) : 'N/A'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                <AmountDisplay amount={dispute.amount} currency={dispute.currency} />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                                {dispute.currency || 'USD'}
                              </div>
                            </div>
                          </div>

                          {/* Dispute Info */}
                          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                <IoShield className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate capitalize">
                                  {dispute.reason ? dispute.reason.replace(/_/g, ' ') : 'Unknown Reason'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  Dispute Case
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dispute Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <IoCalendar className="w-3 h-3" />
                                Created
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {new Date(dispute.created * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Response Due</span>
                              <span className={`font-medium ${dispute.evidence_details?.past_due ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                }) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Status</span>
                              <span className="text-gray-900 dark:text-white capitalize font-medium">
                                {dispute.status?.replace(/_/g, ' ') || 'Pending'}
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
                    data={disputes}
                    loading={loading}
                    emptyMessage="No disputes found"
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