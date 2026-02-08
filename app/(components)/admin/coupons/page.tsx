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
import { motion } from "framer-motion";
import { IoPricetag, IoSearch, IoEye, IoGrid, IoList, IoCheckmarkCircle, IoTime, IoInfinite, IoTrash, IoTicket, IoPencil } from "react-icons/io5";
export default function CouponsPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);
      
      const url = `http://localhost:3001/api/v1/coupons${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const couponsArray = data?.data || [];
        setCoupons(couponsArray);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchCoupons();
  }, [token, search, sort, year, month]);

  const columns = [
    { 
      key: "name", 
      label: "Name/Code", 
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{row.name || 'Untitled'}</div>
          <div className="text-xs text-gray-500 font-mono">{row.id}</div>
        </div>
      )
    },
    { 
      key: "discount", 
      label: "Discount", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-bold text-emerald-600">
          {row.percent_off ? `${row.percent_off}% OFF` : (
            <AmountDisplay amount={row.amount_off || 0} currency={row.currency || 'usd'} />
          )}
        </span>
      )
    },
    { 
      key: "duration", 
      label: "Duration", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="capitalize inline-flex items-center">
          {row.duration === 'forever' ? <IoInfinite className="mr-1" /> : <IoTime className="mr-1" />}
          {row.duration}
          {row.duration_in_months ? ` (${row.duration_in_months} mo)` : ''}
        </span>
      )
    },
    { 
      key: "valid", 
      label: "Valid", 
      sortable: true,
      render: (value: any, row: any) => row.valid ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <IoCheckmarkCircle className="w-3 h-3 mr-1" /> Valid
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <IoCheckmarkCircle className="w-3 h-3 mr-1" /> Invalid
        </span>
      )
    },
    { 
      key: "created", 
      label: "Created", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">{row.created ? new Date(row.created * 1000).toLocaleDateString() : 'N/A'}</span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (value: any, row: any) => (
        <Button size="sm" variant="neutral">
          <IoTrash className="w-3 h-3 text-red-500" />
        </Button>
      )
    }
  ];

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const statsCards = [
    {
      title: "Total Coupons",
      value: coupons.length,
      icon: IoPricetag,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    },
    {
      title: "Valid Coupons",
      value: coupons.filter((c: any) => c.valid).length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "from-emerald-600 to-teal-600"
    }
  ];

  if (loading) return <LoadingState message="Loading coupons..." />;

  return (
    <div className="space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage your discount coupons</p>
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
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
              <Input
                label="Search Coupons"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                leftIcon={<IoSearch className="w-4 h-4" />}
              />
              <Select
                label="Sort By"
                options={[
                  { value: "created:desc", label: "Newest First" },
                  { value: "created:asc", label: "Oldest First" },
                  { value: "name:asc", label: "Name A-Z" }
                ]}
                value={sort}
                onChange={(value) => setSort(value.toString())}
                className="w-full"
              />
            </div>
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
              {coupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card interactive className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors text-sm">
                            {coupon.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">
                            {coupon.code}
                          </p>
                        </div>
                        <div className={`text-xs px-2 py-1.5 rounded-lg flex items-center justify-center ${coupon.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                          {coupon.valid ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span className="font-medium">{coupon.percentOff ? `${coupon.percentOff}%` : `$${coupon.amountOff}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium capitalize">{coupon.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="neutral" className="w-full">
                          <IoPencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="delete" className="w-full">
                          <IoTrash className="w-3 h-3 mr-1" />
                          Delete
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
              data={coupons}
              loading={loading}
              emptyMessage="No coupons found"
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