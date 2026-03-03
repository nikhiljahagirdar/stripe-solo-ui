"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingState } from "@/components";
import { api } from "@/services/api";
import DashboardHeader from "@/components/ui/DashboardHeader";
import AuthGuard from "@/components/auth/AuthGuard";
import { IoAnalytics } from "react-icons/io5";

import AnalyticsFilters from "./components/AnalyticsFilters";
import MetricsCards from "./components/MetricsCards";
import RevenueChart from "./components/RevenueChart";
import RecentTransactions from "./components/RecentTransactions";

// Client-side only component wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return <>{children}</>;
}

interface DashboardData {
  totalRevenue: { growth: number };
  totalCustomers: { count: number; growth: number };
  totalProducts: number;
  totalDisputes: number;
  totalPayoutsCount: number;
  revenueChart: {
    current: Array<{ month: string; revenue: number }>;
  };
}

interface SummaryData {
  currency: string;
  totalRevenue: number;
  availableBalance: number;
  totalPayouts: number;
  pendingBalance: number;
}

interface Account {
  id: string;
  stripeAccountId?: string;
  country: string;
}

export default function AnalyticsPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
    status: "all",
    accountId: "all"
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      try {
        const data = await api.getAccounts(token);
        setAccounts(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const selectedAccountId = filters.accountId === "all" || filters.accountId === "" ? undefined : filters.accountId;
      const selectedYear = filters.year === "all" ? undefined : filters.year;
      const selectedMonth = filters.month === "all" ? undefined : filters.month;

      const query = filters.status !== 'all' ? `status:${filters.status}` : '';

      const [dashboard, summary, payments] = await Promise.all([
        api.getDashboard(token, selectedAccountId, selectedYear),
        api.getAnalyticsSummary(token, selectedAccountId, selectedYear, selectedMonth),
        api.getPayments(token, 1, 5, query, 'created:desc', selectedYear, selectedMonth)
      ]);
      
      setDashboardData(dashboard);
      setSummaryData(summary);
      setRecentTransactions(payments?.data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading && !dashboardData) return (
    <AuthGuard>
      <div className="flex w-full items-center justify-center min-h-screen">
        <LoadingState message="Loading analytics..." />
      </div>
    </AuthGuard>
  );

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summaryData?.currency?.toUpperCase() || 'USD',
    }).format(amount / 100);
  };

  const revenueChartData = dashboardData?.revenueChart?.current?.map((item: any) => ({
    date: item.month,
    amount: item.revenue
  })) || [];

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(summaryData?.totalRevenue),
      change: dashboardData?.totalRevenue?.growth || 0,
      trend: (dashboardData?.totalRevenue?.growth || 0) >= 0 ? "up" as const : "down" as const,
    },
    {
      title: "Net Revenue",
      value: formatCurrency(summaryData?.availableBalance),
      change: 0,
      trend: "up" as const,
    },
    {
      title: "New Customers",
      value: dashboardData?.totalCustomers?.count?.toString() || '0',
      change: dashboardData?.totalCustomers?.growth || 0,
      trend: (dashboardData?.totalCustomers?.growth || 0) >= 0 ? "up" as const : "down" as const,
    },
    {
      title: "Successful Payments",
      value: dashboardData?.totalPayoutsCount?.toString() || '0',
      change: 0,
      trend: "up" as const,
    }
  ];

  return (
    <AuthGuard>
      <ClientOnly>
        <div className="space-y-8 pb-12">
          <DashboardHeader
            title="Analytics & Insights"
            description="Deep dive into your financial performance and business health"
            icon={IoAnalytics}
          />

          <AnalyticsFilters onFiltersChange={handleFiltersChange} accounts={accounts} />

          <MetricsCards metrics={metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <RevenueChart 
                data={revenueChartData} 
                title={`Revenue Trends - ${filters.year === 'all' ? 'All Time' : filters.year}${filters.month !== 'all' ? ` / ${filters.month}` : ''}`} 
              />
              <RecentTransactions transactions={recentTransactions} />
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Business Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Total Products</span>
                    <span className="text-lg font-bold text-gray-900">{dashboardData?.totalProducts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Active Disputes</span>
                    <span className="text-lg font-bold text-red-600">{dashboardData?.totalDisputes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Avg. Payout</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency((summaryData?.totalPayouts || 0) / (dashboardData?.totalPayoutsCount || 1))}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg text-white">
                <h2 className="text-xl font-semibold mb-6">Financial Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center opacity-90">
                    <span className="text-sm">Pending Balance</span>
                    <span className="font-mono font-bold">{formatCurrency(summaryData?.pendingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-90">
                    <span className="text-sm">Total Payouts</span>
                    <span className="font-mono font-bold">{formatCurrency(summaryData?.totalPayouts)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                    <span className="text-sm font-medium font-semibold">Total Net</span>
                    <span className="text-xl font-bold font-mono">{formatCurrency((summaryData?.totalRevenue || 0) - (summaryData?.totalPayouts || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </AuthGuard>
  );
}