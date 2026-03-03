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
  ShieldCheckIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import RevenueOverTime from "./components/RevenueOverTime";
import AuthGuard from "@/components/auth/AuthGuard";

// Client-side only component wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;
  return <>{children}</>;
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  
  // Filters
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("customers");
  const [tabData, setTabData] = useState<any>({
    customers: [], subscriptions: [], invoices: [], payments: [], 
    disputes: [], accounts: [], products: [], prices: []
  });

  const normalizeList = (response: any) => {
    if (Array.isArray(response)) return response;
    return response?.data || response?.items || [];
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      try {
        const accountsRes = await api.getAccounts(token);
        setAccounts(normalizeList(accountsRes));
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };
    fetchAccounts();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const selectedAccountId = accountId === "all" ? undefined : accountId;
      const selectedYear = year === "all" ? undefined : year;
      const selectedMonth = month === "all" ? undefined : month;

      const [dashboard, summary] = await Promise.all([
        api.getDashboard(token, selectedAccountId, selectedYear),
        api.getAnalyticsSummary(token, selectedAccountId, selectedYear, selectedMonth)
      ]);
      
      // Fetch tabbed data with filters
      const [customersRes, subscriptionsRes, invoicesRes, paymentsRes, disputesRes, productsRes, pricesRes] = await Promise.all([
        api.getCustomersList(token, 1, 5, "", "created:desc", selectedYear, selectedMonth),
        api.getSubscriptions(token, 1, 5, "", "created:desc", selectedYear, selectedMonth, selectedAccountId),
        api.getInvoices(token, 1, 5, "", "created:desc", selectedYear, selectedMonth, selectedAccountId),
        api.getPayments(token, 1, 5, "", "created:desc", selectedYear, selectedMonth),
        api.getDisputes(token, 1, 5, "", "created:desc", selectedYear, selectedMonth),
        api.getProducts(token, 1, 5, "", "created:desc", selectedYear, selectedMonth, selectedAccountId),
        api.getPrices(token, undefined, 1, 5, selectedYear, selectedMonth, selectedAccountId)
      ]);

      setDashboardData(dashboard);
      setSummaryData(summary);
      setTabData({
        customers: normalizeList(customersRes),
        subscriptions: normalizeList(subscriptionsRes),
        invoices: normalizeList(invoicesRes),
        payments: normalizeList(paymentsRes),
        disputes: normalizeList(disputesRes),
        accounts: accounts, // already fetched
        products: normalizeList(productsRes),
        prices: normalizeList(pricesRes)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
  }, [token, year, month, accountId]);

  if (loading && !dashboardData) return (
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
        { label: "Customer", render: (row: any) => row.name || row.email || "Unknown" },
        { label: "Email", render: (row: any) => row.email || "—" },
        { label: "Created", render: (row: any) => row.created ? new Date(row.created * 1000).toLocaleDateString() : "—" }
      ],
      rows: tabData.customers
    },
    {
      key: "subscriptions",
      label: "Subscriptions",
      icon: CreditCardIcon,
      columns: [
        { label: "ID", render: (row: any) => row.id || "—" },
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
        { label: "Number", render: (row: any) => row.number || row.id || "—" },
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
        { label: "ID", render: (row: any) => row.id || "—" },
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
        { label: "ID", render: (row: any) => row.id || "—" },
        { label: "Amount", render: (row: any) => <AmountDisplay amount={row.amount || 0} currency={row.currency || currency.toLowerCase()} /> },
        { label: "Status", render: (row: any) => row.status || "—" }
      ],
      rows: tabData.disputes
    },
    {
      key: "products",
      label: "Products",
      icon: TicketIcon,
      columns: [
        { label: "Name", render: (row: any) => row.name || row.id || "—" },
        { label: "Active", render: (row: any) => (row.active ?? true) ? "Yes" : "No" },
        { label: "Created", render: (row: any) => row.created ? new Date(row.created * 1000).toLocaleDateString() : "—" }
      ],
      rows: tabData.products
    }
  ];

  return (
    <AuthGuard>
      <ClientOnly>
        <div className="space-y-6">
          {/* Filters Bar */}
          <Card className="border-none shadow-sm overflow-visible">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FunnelIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Quick Filters:</span>
                </div>
                
                <select
                  title="Account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map((acc: any) => (
                    <option key={acc.id} value={acc.stripeAccountId || acc.id}>
                      {acc.id} ({acc.country})
                    </option>
                  ))}
                </select>

                <select
                  title="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                >
                  <option value="all">All Years</option>
                  {["2023", "2024", "2025", "2026"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  title="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                >
                  <option value="all">All Months</option>
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                    <option key={m} value={m}>{new Date(2000, parseInt(m)-1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <DashboardHeader
            title="Business Overview"
            description="Real-time performance metrics and recent activity"
            icon={CurrencyDollarIcon}
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={formatMoney(summaryData?.totalRevenue)}
              change={`${dashboardData?.totalRevenue?.growth > 0 ? '+' : ''}${dashboardData?.totalRevenue?.growth || 0}%`}
              trend={(dashboardData?.totalRevenue?.growth || 0) >= 0 ? "up" : "down"}
              icon={CurrencyDollarIcon}
              gradient="sunset"
            />
            <StatCard
              title="Total Customers"
              value={dashboardData?.totalCustomers?.count?.toString() || '0'}
              change={`${dashboardData?.totalCustomers?.growth > 0 ? '+' : ''}${dashboardData?.totalCustomers?.growth || 0}%`}
              trend={(dashboardData?.totalCustomers?.growth || 0) >= 0 ? "up" : "down"}
              icon={UserGroupIcon}
              gradient="aurora"
            />
            <StatCard
              title="Available Balance"
              value={formatMoney(summaryData?.availableBalance)}
              icon={CreditCardIcon}
              gradient="ocean"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                <span>Pending: {formatMoney(summaryData?.pendingBalance)}</span>
              </div>
            </StatCard>
            <StatCard
              title="Net Growth"
              value={`${dashboardData?.monthlyGrowth || 0}%`}
              trend={(dashboardData?.monthlyGrowth || 0) >= 0 ? "up" : "down"}
              icon={BanknotesIcon}
              gradient="neon"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader>
                <CardTitle size="lg">Revenue Trends</CardTitle>
                <CardDescription>Performance comparison over time</CardDescription>
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
                <CardDescription>Latest transactions in this period</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {tabData.payments.length > 0 ? (
                        tabData.payments.slice(0, 8).map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{formatMoney(payment.amount)}</div>
                              <div className="text-xs text-gray-500 font-mono">{payment.id.substring(0, 12)}...</div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                payment.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="p-8 text-center text-gray-400">No payments found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs Section */}
          <Card variant="elevated">
            <CardHeader className="border-b border-gray-50">
              <CardTitle size="lg">Data Explorer</CardTitle>
              <CardDescription>Browse all records for the selected period</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 border-b border-gray-100 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-2 py-3 text-xs font-bold border-b-2 transition-all ${
                      activeTab === tab.key
                        ? "border-violet-600 text-violet-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const active = tabs.find((t) => t.key === activeTab);
                  const rows = active?.rows || [];
                  const columns = active?.columns || [];

                  return (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-50">
                          {columns.map((col, i) => <th key={i} className="pb-3 px-3">{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rows.length > 0 ? (
                          rows.slice(0, 5).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                              {columns.map((col: any, j: number) => (
                                <td key={j} className="py-3 px-3 text-gray-600">
                                  {typeof col.render === "function" ? col.render(row) : "—"}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={columns.length} className="py-12 text-center text-gray-400">No data available</td></tr>
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