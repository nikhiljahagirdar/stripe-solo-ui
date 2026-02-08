"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState } from "@/components";
import { api } from "@/services/api";
import DashboardHeader from "@/components/ui/DashboardHeader";
import StatCard from "@/components/ui/StatCard";
import AuthGuard from "@/components/auth/AuthGuard";
import { 
  IoAnalytics, 
  IoPeople, 
  IoCube,
  IoAlertCircle,
  IoCash,
  IoCard,
  IoWallet
} from "react-icons/io5";

// Client-side only component wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AnalyticsPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch both dashboard and summary data
        const [dashboard, summary] = await Promise.all([
          api.getDashboard(token, undefined, year),
          api.getAnalyticsSummary(token, undefined, year, month)
        ]);
        
        setDashboardData(dashboard);
        setSummaryData(summary);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setDashboardData(null);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, year, month]);

  if (loading) return <LoadingState message="Loading analytics..." />;

  // Dashboard metrics
  const totalCustomers = dashboardData?.totalCustomers || 0;
  const totalProducts = dashboardData?.totalProducts || 0;
  const totalDisputes = dashboardData?.totalDisputes || 0;
  const totalPayoutsCount = dashboardData?.totalPayoutsCount || 0;
  const totalPayoutsAmount = dashboardData?.totalPayoutsAmount 
    ? `$${((dashboardData.totalPayoutsAmount) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';

  // Summary metrics
  const totalRevenue = summaryData?.totalRevenue 
    ? `$${((summaryData.totalRevenue) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';
  const totalPayouts = summaryData?.totalPayouts 
    ? `$${((summaryData.totalPayouts) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';
  const availableBalance = summaryData?.availableBalance 
    ? `$${((summaryData.availableBalance) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';
  const pendingBalance = summaryData?.pendingBalance 
    ? `$${((summaryData.pendingBalance) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';

  return (
    <AuthGuard>
      <ClientOnly>
        <div className="space-y-8">
          <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
            {/* Header */}
            <DashboardHeader
              title="Analytics Dashboard"
              description="Track your business performance with real-time insights and metrics"
              icon={IoAnalytics}
              stats={[
                {
                  label: "Total Revenue",
                  value: totalRevenue,
                  change: "",
                  trend: "up"
                },
                {
                  label: "Available Balance",
                  value: availableBalance,
                  change: "",
                  trend: "up"
                }
              ]}
            />

            {/* Financial Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Financial Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={totalRevenue}
                  icon={IoCash}
                  gradient="success"
                />
                <StatCard
                  title="Total Payouts"
                  value={totalPayouts}
                  icon={IoCard}
                  gradient="info"
                />
                <StatCard
                  title="Available Balance"
                  value={availableBalance}
                  icon={IoWallet}
                  gradient="warning"
                />
                <StatCard
                  title="Pending Balance"
                  value={pendingBalance}
                  icon={IoCash}
                  gradient="payments"
                />
              </div>
            </div>

            {/* Business Metrics */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Business Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Customers"
                  value={totalCustomers.toString()}
                  icon={IoPeople}
                  gradient="customers"
                />
                <StatCard
                  title="Total Products"
                  value={totalProducts.toString()}
                  icon={IoCube}
                  gradient="subscriptions"
                />
                <StatCard
                  title="Total Disputes"
                  value={totalDisputes.toString()}
                  icon={IoAlertCircle}
                  gradient="danger"
                />
                <StatCard
                  title="Payouts Count"
                  value={totalPayoutsCount.toString()}
                  icon={IoCard}
                  gradient="info"
                />
              </div>
            </div>

            {/* Payout Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Payout Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="Total Payouts Amount"
                  value={totalPayoutsAmount}
                  icon={IoCash}
                  gradient="revenue"
                />
                <StatCard
                  title="Number of Payouts"
                  value={totalPayoutsCount.toString()}
                  icon={IoCard}
                  gradient="payments"
                />
              </div>
            </div>
        </div>
      </ClientOnly>
    </AuthGuard>
  );
}