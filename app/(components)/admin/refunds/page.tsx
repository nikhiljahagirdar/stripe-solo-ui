"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import{ Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import  DaisyTable  from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { motion } from "framer-motion";
import { 
  IoAdd,
  IoSearch,
  IoRefresh,
  IoCash,
  IoCheckmarkCircle,
  IoTime,
  IoGrid,
  IoList,
} from "react-icons/io5";
import CreateRefundModal from "./components/CreateRefundModal";
import RefundCard from "./components/RefundCard";

export default function RefundsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [view, setView] = useState('table');
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState('created:desc');
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [reason, setReason] = useState('all');

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (period && period !== 'all') params.append('period', period);
      if (status && status !== 'all') params.append('status', status);
      if (currency && currency !== 'all') params.append('currency', currency);
      if (reason && reason !== 'all') params.append('reason', reason);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      const response = await fetch(`http://localhost:3001/api/v1/refunds?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.data || (Array.isArray(data) ? data : []));
        setTotalCount(data.totalCount || data.data?.length || 0);
      } else {
        setRefunds([]);
      }
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRefunds();
    }
  }, [token, search, page, pageSize, sort, startDate, endDate, period, status, currency, reason, year, month]);

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const columns = [
    { key: "amount", label: "Amount", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
    { key: "created", label: "Date", sortable: true },
    { key: "source", label: "Source" },
  ];

  const renderCell = useCallback((item: any, columnKey: string) => {
    switch (columnKey) {
      case "amount":
        return (
          <span className="font-medium text-gray-900">
             <AmountDisplay amount={item.amount} currency={item.currency} />
          </span>
        );
      case "status":
        return <StatusBadge status={item.status} />;
      case "reason":
        return (
          <span className="capitalize text-gray-600">
            {item.reason ? item.reason.replace(/_/g, ' ') : 'N/A'}
          </span>
        );
      case "created":
        return (
          <span className="text-gray-500 text-sm">
            {new Date(item.created * 1000).toLocaleDateString()}
          </span>
        );
      case "source":
        return (
          <div className="flex flex-col text-xs">
            {item.charge && <span className="font-mono text-gray-600">Charge: {item.charge}</span>}
            {item.payment_intent && <span className="font-mono text-gray-600">PI: {item.payment_intent}</span>}
          </div>
        );
      default:
        return item[columnKey];
    }
  }, []);

  const statsCards = [
    {
      title: "Total Refunds",
      value: refunds.length,
      icon: IoCash,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-600 to-cyan-600"
    },
    {
      title: "Succeeded",
      value: refunds.filter(r => r.status === 'succeeded').length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-600 to-green-600"
    },
    {
      title: "Pending/Failed",
      value: refunds.filter(r => r.status !== 'succeeded').length,
      icon: IoTime,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "from-amber-600 to-orange-600"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-gray-500">Manage and view processed refunds.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-violet-600 text-white hover:bg-violet-700">
          <IoAdd className="mr-2 h-4 w-4" />
          Create Refund
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              interactive
              variant="elevated"
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.iconBg} text-white shadow-xl shadow-violet-500/25 group-hover:shadow-2xl group-hover:shadow-violet-500/40 transition-all duration-300`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      {stat.title}
                    </div>
                  </div>
                </div>
                
                <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.iconBg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card variant="elevated">
        <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input 
                label="Start Date" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
              <Input 
                label="End Date" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
              <Select 
                label="Period" 
                options={[
                  {value: 'all', label: 'All Time'}, 
                  {value: '7d', label: 'Last 7 Days'}, 
                  {value: '30d', label: 'Last 30 Days'}, 
                  {value: '90d', label: 'Last 90 Days'}, 
                  {value: '1y', label: 'Last Year'}
                ]} 
                value={period} 
                onChange={(v) => setPeriod(v.toString())} 
              />
              <Select 
                label="Status" 
                options={[
                  {value: 'all', label: 'All Status'}, 
                  {value: 'succeeded', label: 'Succeeded'}, 
                  {value: 'pending', label: 'Pending'}, 
                  {value: 'failed', label: 'Failed'}, 
                  {value: 'canceled', label: 'Canceled'}
                ]} 
                value={status} 
                onChange={(v) => setStatus(v.toString())} 
              />
              <Select 
                label="Reason" 
                options={[
                  {value: 'all', label: 'All Reasons'}, 
                  {value: 'duplicate', label: 'Duplicate'}, 
                  {value: 'fraudulent', label: 'Fraudulent'}, 
                  {value: 'requested_by_customer', label: 'Requested by Customer'}
                ]} 
                value={reason} 
                onChange={(v) => setReason(v.toString())} 
              />
              <div className="flex items-center justify-between gap-2 w-full md:w-auto flex-1">
                <Input
                  placeholder="Search by ID, status, currency or reason..."
                  label="Id,Status Currency,Reason"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<IoSearch className="w-4 h-4" />}
                  className="max-w-md"
                />
                <Button variant="neutral" style="soft" onClick={fetchRefunds} disabled={loading} leftIcon={<IoRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}>
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
              {/* Filters on Left */}
              <div className="flex items-center gap-2">
              
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
              refunds.length === 0 && !loading ? (
                <EmptyState
                  title="No data found"
                  description="No refunds match your current filters."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {refunds.map((refund, index) => (
                    <motion.div
                      key={refund.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <RefundCard refund={refund} />
                    </motion.div>
                  ))}
                </div>
              )
            )}
            {view === 'table' && (
              <DaisyTable
                columns={columns}
                data={refunds}
                loading={loading}
                emptyMessage="No refunds found"
              />
            )}
        </CardContent>
      </Card>

      <CreateRefundModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefundCreated={() => {
            setIsCreateModalOpen(false);
            fetchRefunds();
        }}
        token={token || ''}
      />
    </div>
  );
}