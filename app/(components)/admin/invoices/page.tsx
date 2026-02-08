"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import{ Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import DaisyTable  from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { motion } from "framer-motion";
import { IoDocument, IoSearch, IoEye, IoDownload, IoSend, IoGrid, IoList, IoCheckmarkCircle, IoTime, IoCloseCircle, IoPencil, IoAlertCircle } from "react-icons/io5";

export default function InvoicesPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchInvoices = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      const url = `http://localhost:3001/api/v1/invoices${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const invoicesArray = data?.data || [];
        setInvoices(invoicesArray);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchInvoices();
  }, [token, search, sort, year, month]);

  const columns = [
    { 
      key: "number", 
      label: "Invoice #", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium">
          #{row.number || 'N/A'}
        </span>
      )
    },
    { 
      key: "customer", 
      label: "Customer", 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="font-medium text-gray-900">
          {row.customer_name || 'Unknown'}
        </div>
      )
    },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-medium">
          <AmountDisplay amount={row.amount_due || 0} currency={row.currency || 'usd'} />
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.status || 'draft')
    },
    { 
      key: "dueDate", 
      label: "Due Date", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.due_date ? new Date(row.due_date * 1000).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (value: any, row: any) => (
        <div className="flex space-x-1">
          <Button size="sm" variant="view" style="soft">
            <IoEye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="neutral" style="soft">
            <IoDownload className="w-3 h-3" />
          </Button>
        </div>
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
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid', icon: IoCheckmarkCircle },
      open: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open', icon: IoTime },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: IoPencil },
      void: { bg: 'bg-red-100', text: 'text-red-700', label: 'Void', icon: IoCloseCircle },
      uncollectible: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Uncollectible', icon: IoAlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: IoDocument };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const statsCards = [
    {
      title: "Total Invoices",
      value: invoices.length,
      icon: IoDocument,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    },
    {
      title: "Paid Invoices",
      value: invoices.filter((i) => i.status === 'paid').length,
      icon: IoCheckmarkCircle,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    }
  ];

  if (loading) return <LoadingState message="Loading invoices..." />;

  return (
    <div className="space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage customer invoices and billing</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                {/* Animated background elements */}
                <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.iconBg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & Content */}
      <Card variant="elevated">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Search Invoices"
              placeholder="Search by number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
            
            <Select
              label="Sort By"
              options={[
                { value: "created:desc", label: "Newest First" },
                { value: "created:asc", label: "Oldest First" },
                { value: "amount:desc", label: "Amount High to Low" },
                { value: "amount:asc", label: "Amount Low to High" },
                { value: "status:asc", label: "Status A-Z" }
              ]}
              value={sort}
              onChange={(value) => setSort(value.toString())}
              className="w-full"
            />
            
            <div></div>

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

          {view === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card interactive variant="elevated" className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                            Invoice #{invoice.number || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            <AmountDisplay amount={invoice.amount_due || 0} currency={invoice.currency || 'usd'} />
                          </p>
                        </div>
                        {getStatusBadge(invoice.status || 'draft')}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Customer:</span>
                          <span className="font-medium">{invoice.customer_name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due Date:</span>
                          <span className="font-medium">
                            {invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="neutral" style="soft" className="flex-1">
                          <IoEye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="neutral" style="soft" className="flex-1">
                          <IoDownload className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <DaisyTable
              columns={columns}
              data={invoices}
              loading={loading}
              emptyMessage="No invoices found"
              striped
              hoverable
              onSort={(key, direction) => {
                setSortDescriptor({ column: key, direction: direction === 'asc' ? 'ascending' : 'descending' });
                setSort(`${key}:${direction}`);
              }}
              sortKey={sortDescriptor.column}
              sortDirection={sortDescriptor.direction === 'ascending' ? 'asc' : 'desc'}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}