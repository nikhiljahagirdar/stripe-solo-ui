"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingState, AmountDisplay } from "@/components";
import { api } from "@/services/api";
import DashboardHeader from "@/components/ui/DashboardHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserGroupIcon,
  DocumentTextIcon,
  TicketIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import RevenueOverTime from "./components/RevenueOverTime";
import AuthGuard from "@/components/auth/AuthGuard";

// Client-side only component wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [filter, setFilter] = useState("year");
  const currentYear = new Date().getFullYear().toString();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "customers" | "subscriptions" | "invoices" | "payments" | "disputes" | "accounts" | "products" | "prices"
  >("customers");
  const [tabData, setTabData] = useState({
    customers: [] as any[],
    subscriptions: [] as any[],
    invoices: [] as any[],
    payments: [] as any[],
    disputes: [] as any[],
    accounts: [] as any[],
    products: [] as any[],
    prices: [] as any[]
  });

  const normalizeList = (response: any) => {
    if (Array.isArray(response)) return response;
    return response?.data || response?.items || [];
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const yearParam = filter === "year" ? currentYear : undefined;
      
      const [dashboard, summary] = await Promise.all([
        api.getDashboard(token, undefined, yearParam),
        api.getAnalyticsSummary(token, undefined, yearParam)
      ]);
      
      // Fetch tabbed data
      const [customersRes, subscriptionsRes, invoicesRes, paymentsRes, disputesRes, accountsRes, productsRes, pricesRes] = await Promise.all([
        api.getCustomersList(token, 1, 5, "", "created:desc"),
        api.getSubscriptions(token, 1, 5, "", "created:desc"),
        api.getInvoices(token, 1, 5, "", "created:desc"),
        api.getPayments(token, 1, 5, "", "created:desc"),
        api.getDisputes(token, 1, 5, "", "created:desc"),
        api.getAccounts(token),
        api.getProducts(token, 1, 5, "", "created:desc"),
        api.getPrices(token, undefined, 1, 5)
      ]);

      setDashboardData(dashboard);
      setSummaryData(summary);
      setTabData({
        customers: normalizeList(customersRes),
        subscriptions: normalizeList(subscriptionsRes),
        invoices: normalizeList(invoicesRes),
        payments: normalizeList(paymentsRes),
        disputes: normalizeList(disputesRes),
        accounts: normalizeList(accountsRes),
        products: normalizeList(productsRes),
        prices: normalizeList(pricesRes)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        totalRevenue: { amount: 0, growth: 0 },
        totalCustomers: { count: 0, growth: 0 },
        monthlyGrowth: 0,
        revenueChart: { current: [], previous: [] },
        filterType: 'year',
        recentTransactions: []
      });
      setSummaryData({
        totalRevenue: 0,
        totalPayouts: 0,
        availableBalance: 0,
        pendingBalance: 0,
        currency: "usd"
      });
      setTabData({
        customers: [],
        subscriptions: [],
        invoices: [],
        payments: [],
        disputes: [],
        accounts: [],
        products: [],
        prices: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [token, filter]);

  if (loading) return (
    <AuthGuard>
      <div className="flex w-full items-center justify-center min-h-screen">
        <LoadingState message="Loading dashboard..." />
      </div>
    </AuthGuard>
  );

  const currency = (summaryData?.currency || "usd").toUpperCase();
  const formatMoney = (amount?: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format((amount || 0) / 100);

  const tabs = [
    {
      key: "customers",
      label: "Customers",
      icon: UserGroupIcon,
      columns: [
        { label: "Customer", render: (row: any) => row.name || row.customerName || row.email || "Unknown" },
        { label: "Email", render: (row: any) => row.email || row.customerEmail || "—" },
        { label: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.created ? new Date(row.created * 1000).toLocaleDateString() : "—" }
      ],
      rows: tabData.customers
    },
    {
      key: "subscriptions",
      label: "Subscriptions",
      icon: CreditCardIcon,
      columns: [
        { label: "Subscription", render: (row: any) => row.id || row.subscriptionId || "—" },
        { label: "Status", render: (row: any) => row.status || "—" },
        { label: "Plan", render: (row: any) => row.plan?.nickname || row.plan?.interval || "—" }
      ],
      rows: tabData.subscriptions
    },
    {
      key: "invoices",
      label: "Invoices",
      icon: DocumentTextIcon,
      columns: [
        { label: "Invoice", render: (row: any) => row.number || row.id || "—" },
        { label: "Amount", render: (row: any) => <AmountDisplay amount={row.amount_due || row.amount || 0} currency={row.currency || currency.toLowerCase()} /> },
        { label: "Status", render: (row: any) => row.status || "—" }
      ],
      rows: tabData.invoices
    },
    {
      key: "payments",
      label: "Payments",
      icon: CreditCardIcon,
      columns: [
        { label: "Payment", render: (row: any) => row.paymentIntentId || row.id || "—" },
        { label: "Amount", render: (row: any) => <AmountDisplay amount={row.amount || 0} currency={row.currency || currency.toLowerCase()} /> },
        { label: "Status", render: (row: any) => row.status || "—" }
      ],
      rows: tabData.payments
    },
    {
      key: "disputes",
      label: "Disputes",
      icon: ShieldCheckIcon,
      columns: [
        { label: "Dispute", render: (row: any) => row.id || row.disputeId || "—" },
        { label: "Amount", render: (row: any) => <AmountDisplay amount={row.amount || 0} currency={row.currency || currency.toLowerCase()} /> },
        { label: "Status", render: (row: any) => row.status || "—" }
      ],
      rows: tabData.disputes
    },
    {
      key: "accounts",
      label: "Accounts",
      icon: BanknotesIcon,
      columns: [
        { label: "Account", render: (row: any) => row.stripeAccountId || row.id || "—" },
        { label: "Country", render: (row: any) => (row.country || "").toUpperCase() || "—" },
        { label: "Type", render: (row: any) => row.type || row.businessType || "—" }
      ],
      rows: tabData.accounts
    },
    {
      key: "products",
      label: "Products",
      icon: TicketIcon,
      columns: [
        { label: "Product", render: (row: any) => row.name || row.id || "—" },
        { label: "Active", render: (row: any) => (row.active ?? true) ? "Yes" : "No" },
        { label: "Created", render: (row: any) => row.created ? new Date(row.created * 1000).toLocaleDateString() : "—" }
      ],
      rows: tabData.products
    },
    {
      key: "prices",
      label: "Pricing",
      icon: CurrencyDollarIcon,
      columns: [
        { label: "Price", render: (row: any) => row.nickname || row.id || "—" },
        { label: "Amount", render: (row: any) => <AmountDisplay amount={row.unitAmount || row.amount || 0} currency={row.currency || currency.toLowerCase()} /> },
        { label: "Interval", render: (row: any) => row.recurring?.interval || "—" }
      ],
      rows: tabData.prices
    }
  ];

  return (
    <AuthGuard>
      <ClientOnly>
        <div className="space-y-6">
          {/* Dashboard Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <DashboardHeader
            title="Primary Dashboard"
            description="Revenue, balances, and activity at a glance"
            icon={CurrencyDollarIcon}
          >
            <div className="flex flex-wrap gap-2">
              <Button
                variant="success"
                style="solid"
                size="sm"
                onClick={() => router.push('/admin/analytics')}
              >
                View Analytics
              </Button>
              <Button variant="neutral" style="soft" size="sm">
                Export Report
              </Button>
            </div>
          </DashboardHeader>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={formatMoney(dashboardData?.totalRevenue?.amount)}
              change={`${dashboardData?.totalRevenue?.growth > 0 ? '+' : ''}${dashboardData?.totalRevenue?.growth}%`}
              trend={dashboardData?.totalRevenue?.growth >= 0 ? "up" : "down"}
              icon={CurrencyDollarIcon}
              gradient="sunset"
            />
            <StatCard
              title="Total Customers"
              value={dashboardData?.totalCustomers?.count?.toString() || '0'}
              change={`${dashboardData?.totalCustomers?.growth > 0 ? '+' : ''}${dashboardData?.totalCustomers?.growth}%`}
              trend={dashboardData?.totalCustomers?.growth >= 0 ? "up" : "down"}
              icon={UserGroupIcon}
              gradient="aurora"
            />
            <StatCard
              title="Total Payouts"
              value={formatMoney(summaryData?.totalPayouts)}
              icon={BanknotesIcon}
              gradient="neon"
            />
            <StatCard
              title="Available Balance"
              value={formatMoney(summaryData?.availableBalance)}
              icon={CreditCardIcon}
              gradient="ocean"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Pending</span>
                <span>{formatMoney(summaryData?.pendingBalance)}</span>
              </div>
            </StatCard>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader>
                <CardTitle size="lg">Revenue Overview</CardTitle>
                <CardDescription>{filter === 'year' ? 'Current year vs last year' : 'Current period comparison'}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RevenueOverTime
                  currentYearData={dashboardData?.revenueChart?.current || []}
                  lastYearData={dashboardData?.revenueChart?.previous || []}
                />
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle size="lg">Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {tabData.payments && tabData.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Payment ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tabData.payments.slice(0, 10).map((payment: any, index: number) => (
                          <tr key={payment.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs truncate max-w-xs">{payment.id || payment.paymentIntentId || '—'}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                              <AmountDisplay amount={payment.amount || 0} currency={payment.currency || 'usd'} />
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{payment.customerName || payment.customer?.name || '—'}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'succeeded' || payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                payment.status === 'pending' || payment.status === 'processing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {payment.status || 'unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                              {payment.created ? new Date(payment.created * 1000).toLocaleDateString() : payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent payments</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Payment records will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables with Tabs */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle size="lg">Detailed Tables</CardTitle>
              <CardDescription>Quick view of the latest records by category</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`inline-flex items-center gap-2 px-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 overflow-x-auto">
                {(() => {
                  const active = tabs.find((t) => t.key === activeTab);
                  const rows = active?.rows || [];
                  const columns = active?.columns || [];

                  return (
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {columns.map((col, index) => (
                            <th key={`${active?.key}-head-${index}`} className="py-2 px-3">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {rows.length > 0 ? (
                          rows.slice(0, 5).map((row, rowIndex) => (
                            <tr key={`${active?.key}-row-${rowIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                              {columns.map((col, colIndex) => (
                                <td key={`${active?.key}-cell-${rowIndex}-${colIndex}`} className="py-3 px-3 text-gray-700 dark:text-gray-200">
                                  {typeof col.render === "function" ? col.render(row) : "—"}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={columns.length} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No data available for this section.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientOnly>
    </AuthGuard>
  );
}