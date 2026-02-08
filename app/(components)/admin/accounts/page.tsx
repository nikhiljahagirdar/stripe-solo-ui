"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components"; // Assuming LoadingState and AmountDisplay are pure Tailwind or will be refactored
import EmptyState from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import{ Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select"; // Assuming Select is pure Tailwind or will be refactored
import Table from "@/components/ui/Table"; // Refactored from DaisyTable
import Modal from "@/components/common/Modal"; // New Tailwind-only Modal
import StatCard from "@/components/common/StatCard"; // Tailwind-only StatCard

import { motion } from "framer-motion";
import { 
  IoWallet, 
  IoSearch, 
  IoGrid, 
  IoList, 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoGlobe,
  IoBusiness,
  IoEye,
  IoSettings,
  IoWarning
} from "react-icons/io5";

export default function AccountsPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  // Balance Modal
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<{ available: any[], pending: any[] } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const handleViewBalance = useCallback(async (accountId: string) => {
    setBalanceLoading(true);
    setSelectedBalance(null);
    setIsBalanceModalOpen(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/v1/balance/${accountId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.balance) {
          setSelectedBalance(data.balance);
        } else {
          setSelectedBalance(data);
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  }, [token]);

  const fetchAccounts = async () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      const url = `http://localhost:3001/api/v1/accounts${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const accountsArray = data?.data || [];
        setAccounts(accountsArray);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchAccounts();
  }, [token, search, sort, year, month]);

  const columns = [
    { 
      key: "stripeAccountId", 
      label: "Account ID", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm font-medium text-gray-700">
          {row.stripeAccountId}
        </span>
      )
    },
    { 
      key: "type", 
      label: "Type", 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="capitalize">
          <span className="text-gray-900 font-medium">{row.businessType || 'Standard'}</span>
          <span className="text-xs text-gray-500 block">{row.type}</span>
        </div>
      )
    },
    { 
      key: "country", 
      label: "Country", 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <IoGlobe className="text-gray-400" />
          <span className="uppercase">{row.country}</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-xs">
            {row.chargesEnabled ? (
              <span className="text-emerald-600 flex items-center"><IoCheckmarkCircle className="mr-1" /> Charges</span>
            ) : (
              <span className="text-gray-400 flex items-center"><IoCloseCircle className="mr-1" /> Charges</span>
            )}
          </div>
          <div className="flex items-center text-xs">
            {row.payoutsEnabled ? (
              <span className="text-emerald-600 flex items-center"><IoCheckmarkCircle className="mr-1" /> Payouts</span>
            ) : (
              <span className="text-gray-400 flex items-center"><IoCloseCircle className="mr-1" /> Payouts</span>
            )}
          </div>
        </div>
      )
    },
    { 
      key: "created", 
      label: "Created", 
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (value: any, row: any) => (
        <div className="flex space-x-1 justify-center">
          <Button 
            variant="view" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="View account balance"
            leftIcon={<IoEye className="w-3 h-3" />}
            onClick={() => handleViewBalance(row.id)}
          />
          <Button 
            variant="edit" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Edit account"
            leftIcon={<IoSettings className="w-3 h-3" />}
          />
        </div>
      )
    }
  ];

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const statsCardsData = [ // Renamed to statsCardsData to avoid conflict with `Card` component
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: IoWallet,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-600 to-cyan-600"
    },
    {
      title: "Charges Enabled",
      value: accounts.filter(a => a.chargesEnabled).length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-600 to-green-600"
    },
    {
      title: "Payouts Enabled",
      value: accounts.filter(a => a.payoutsEnabled).length,
      icon: IoBusiness,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    }
  ];

  if (loading) return <LoadingState message="Loading accounts..." />;

  return (
    <div className="space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage connected Stripe accounts</p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCardsData.map((stat, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Search Accounts"
              placeholder="Search by ID..."
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
                { value: "type:asc", label: "Type A-Z" }
              ]}
              value={sort}
              onChange={(value) => setSort(value.toString())}
              className="w-full"
            />
            
            <div></div>
            
            <div className="flex items-end justify-end">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
                <button
                  onClick={() => setView('card')}
                  className={`flex items-center px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                    view === 'card'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-violet-50'
                  }`}
                >
                  <IoGrid className="w-3 h-3 mr-1" />
                  Cards
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                    view === 'table'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-violet-50'
                  }`}
                >
                  <IoList className="w-3 h-3 mr-1" />
                  Table
                </button>
              </div>
            </div>
          </div>

          {view === 'card' && (
            accounts.length === 0 && !loading ? (
              <EmptyState
                title="No data found"
                description="No accounts match your current filters."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                  <Card interactive variant="elevated" className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                            <IoWallet className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                              {account.stripeAccountId || 'N/A'}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono">
                              {account.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {account.businessType || 'Standard'}
                          </span>
                          <span className="text-xs text-gray-500 uppercase">
                            {account.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <IoGlobe className="text-gray-400" />
                          <span className="uppercase text-sm">{account.country}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            {account.chargesEnabled ? (
                              <span className="text-emerald-600 flex items-center"><IoCheckmarkCircle className="mr-1" /> Charges</span>
                            ) : (
                              <span className="text-gray-400 flex items-center"><IoCloseCircle className="mr-1" /> Charges</span>
                            )}
                          </div>
                          <div className="flex items-center text-xs">
                            {account.payoutsEnabled ? (
                              <span className="text-emerald-600 flex items-center"><IoCheckmarkCircle className="mr-1" /> Payouts</span>
                            ) : (
                              <span className="text-gray-400 flex items-center"><IoCloseCircle className="mr-1" /> Payouts</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="view" 
                          style="soft" 
                          size="sm" 
                          iconOnly
                          ariaLabel="View account balance"
                          leftIcon={<IoEye className="w-3 h-3" />}
                          onClick={() => handleViewBalance(account.id)}
                        />
                        <Button 
                          variant="edit" 
                          style="soft" 
                          size="sm" 
                          iconOnly
                          ariaLabel="Edit account"
                          leftIcon={<IoSettings className="w-3 h-3" />}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </div>
            )
          )}
          {view === 'table' && (
            <Table
              columns={columns}
              data={accounts}
              loading={loading}
              emptyMessage="No accounts found"
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

      <Modal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title="Account Balance"
        size="2xl"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">Balance information will be displayed here</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}