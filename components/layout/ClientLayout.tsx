"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  CreditCardIcon,
  ArrowPathIcon,
  CubeIcon,
  BuildingOfficeIcon,
  KeyIcon,
  CogIcon,
  DocumentTextIcon,
  TagIcon,
  BanknotesIcon,
  BellIcon,
  DocumentChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: SidebarItem[] = [
  { name: "Overview", href: "/admin/dashboard", icon: ChartBarIcon },
  { name: "Analytics", href: "/admin/analytics", icon: PresentationChartLineIcon },
  { name: "Customers", href: "/admin/customers", icon: UserGroupIcon },
  { name: "Payments", href: "/admin/payments", icon: CreditCardIcon },
  { name: "Invoices", href: "/admin/invoices", icon: DocumentTextIcon },
  { name: "Refunds", href: "/admin/refunds", icon: BanknotesIcon },
  { name: "Products", href: "/admin/products", icon: CubeIcon },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: ArrowPathIcon },
  { name: "Coupons", href: "/admin/coupons", icon: TagIcon },
  { name: "Accounts", href: "/admin/accounts", icon: BuildingOfficeIcon },
  { name: "Balance", href: "/admin/balance", icon: BanknotesIcon },
  { name: "Payouts", href: "/admin/payouts", icon: BanknotesIcon },
  { name: "Disputes", href: "/admin/disputes", icon: DocumentTextIcon },
  { name: "Users List", href: "/admin/users", icon: UsersIcon },
  { name: "Roles", href: "/admin/users/roles", icon: ShieldCheckIcon },
  { name: "Master Permissions", href: "/admin/users/permissions", icon: KeyIcon },
  { name: "API Keys", href: "/admin/addKey", icon: KeyIcon },
  { name: "Settings", href: "/admin/dashboard/settings", icon: CogIcon },
  { name: "Reports", href: "/admin/reports", icon: DocumentChartBarIcon },
  { name: "Events", href: "/admin/events", icon: BellIcon },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar items={menuItems.map(item => ({...item, label: item.name, icon: React.createElement(item.icon)}))} isOpen={sidebarOpen} onClose={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/" className="text-xl font-semibold text-gray-800 ml-4">
              StripeTool
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}