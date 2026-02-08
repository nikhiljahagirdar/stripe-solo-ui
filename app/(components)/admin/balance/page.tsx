"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { motion } from "framer-motion";
import { IoWallet, IoTime, IoCheckmarkCircle, IoChevronDown } from "react-icons/io5";

interface Balance {
  amount: number;
  currency: string;
}

interface Account {
  id: string | number;
  stripeAccountId: string;
  email: string | null;
  businessProfileName?: string | null;
  business_profile?: {
    name?: string | null;
  };
}

interface BalanceResponse {
  balance: {
    available: Balance[];
    pending: Balance[];
  };
  account: {
    id: number;
    userId: number;
    stripe_key_id: number;
    stripeAccountId: string;
    businessType: string;
    country: string;
    defaultCurrency: string;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    email: string | null;
    displayName: string | null;
    businessProfileName: string | null;
    businessProfileUrl: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function BalancePage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  
  const [balance, setBalance] = useState<{ available: Balance[], pending: Balance[] } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("platform");
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      const response = await fetch(`http://localhost:3001/api/v1/accounts${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchBalance = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      let url = 'http://localhost:3001/api/v1/balance';
      if (selectedAccount && selectedAccount !== "platform") {
        url = `http://localhost:3001/api/v1/balance/${selectedAccount}`;
      }

      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: BalanceResponse = await response.json();
        setBalance(data.balance);
      } else {
        setBalance(null);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
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
  }, [token, year, month]);

  useEffect(() => {
    if (token) {
      fetchBalance();
    }
  }, [token, selectedAccount, year, month]);

  const availableBalance = balance?.available || [];
  const pendingBalance = balance?.pending || [];

  const totalAvailable = availableBalance.reduce((sum, b) => sum + b.amount, 0);
  const totalPending = pendingBalance.reduce((sum, b) => sum + b.amount, 0);
  const primaryCurrency = availableBalance[0]?.currency || 'usd';

  const statsCards = [
    {
      title: "Available Balance",
      value: totalAvailable,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "from-emerald-600 to-teal-600",
      format: "currency",
      currency: primaryCurrency
    },
    {
      title: "Pending Balance",
      value: totalPending,
      icon: IoTime,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "from-amber-600 to-orange-600",
      format: "currency",
      currency: primaryCurrency
    }
  ];

  const balanceDetailsCards = [
    {
      title: "Available Funds",
      description: "Funds ready to be paid out.",
      icon: IoCheckmarkCircle,
      iconColor: "text-emerald-500",
      amountColor: "text-emerald-600",
      data: availableBalance,
      emptyMessage: "No available funds."
    },
    {
      title: "Pending Funds",
      description: "Funds that are not yet available.",
      icon: IoTime,
      iconColor: "text-amber-500",
      amountColor: "text-amber-600",
      data: pendingBalance,
      emptyMessage: "No pending funds."
    }
  ];

  return (
    <div className="space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header with Account Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Balance</h1>
          <p className="text-gray-600 mt-1">View your available and pending funds</p>
        </div>
        {accounts.length > 1 && (
          <div className="flex items-center gap-3">
            <Select
              label="Select Account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              options={[
                { value: "platform", label: "Platform Account" },
                ...accounts.map(account => ({
                  value: account.id.toString(),
                  label: account.businessProfileName || account.business_profile?.name || `Account ${account.id}`
                }))
              ]}
              className="w-64"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {loading ? (
        <LoadingState message="Loading account balance..." />
      ) : !balance ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <p className="text-gray-500"></p>
          </CardContent>
        </Card>
      ) : (
        <>
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
                          {stat.format === 'currency' ? (
                            <AmountDisplay amount={stat.value || 0} currency={stat.currency} />
                          ) : (
                            stat.value.toLocaleString()
                          )}
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

          {/* Filter */}
          <Card variant="elevated">
            <CardContent className="p-6">
              {accounts.length > 1 && (
                <div className="flex justify-end items-center relative">
                  <select
                    className="h-10 pl-3 pr-10 text-sm bg-white/80 backdrop-blur-sm border rounded-lg appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 hover:border-violet-400 hover:shadow-md hover:shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed border-gray-200"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    aria-label="Select Account"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.businessProfileName || account.business_profile?.name || account.email || 'Unnamed Account'} ({account.stripeAccountId})
                      </option>
                    ))}
                  </select>
                  <IoChevronDown className="absolute right-3 text-gray-500 pointer-events-none" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {balanceDetailsCards.map((card, index) => (
              <Card key={index} variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2"><card.icon className={`h-5 w-5 ${card.iconColor}`} /><span>{card.title}</span></CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {card.data.length > 0 ? card.data.map(b => (
                    <div key={b.currency} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-lg font-semibold uppercase text-gray-700">{b.currency}</span>
                      <span className={`text-lg font-bold ${card.amountColor}`}><AmountDisplay amount={b.amount} currency={b.currency} /></span>
                    </div>
                  )) : <p className="text-gray-500">{card.emptyMessage}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}