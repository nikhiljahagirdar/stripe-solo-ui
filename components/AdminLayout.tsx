"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { 
  HiChartBar, HiPresentationChartLine, HiUserGroup, HiCreditCard,
  HiCube, HiBanknotes, HiUsers, HiCog, HiDocumentChartBar, HiBuildingOffice,
  HiDocumentText, HiReceiptRefund, HiArrowPath, HiTag, HiShieldExclamation, HiBell 
} from "react-icons/hi2";
import AccountSelect from "@/components/common/AccountSelect";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
}

const getPageInfo = (pathname: string) => {
  const routes = {
    "/admin/initsetup": { title: "Setup Stripe", icon: HiCog, description: "Configure your Stripe account" },
    "/admin/dashboard": { title: "Dashboard Overview", icon: HiChartBar, description: "Monitor your business performance" },
    "/admin/analytics": { title: "Analytics", icon: HiPresentationChartLine, description: "Detailed insights and reports" },
    "/admin/customers": { title: "Customers", icon: HiUserGroup, description: "Manage customer accounts" },
    "/admin/payments": { title: "Payments", icon: HiCreditCard, description: "Track payment transactions" },
    "/admin/invoices": { title: "Invoice Management", icon: HiDocumentText, description: "Create and manage customer invoices" },
    "/admin/refunds": { title: "Refunds", icon: HiReceiptRefund, description: "Monitor refund transactions and status" },
    "/admin/disputes": { title: "Disputes", icon: HiShieldExclamation, description: "Manage chargebacks and inquiries" },
    "/admin/products": { title: "Products", icon: HiCube, description: "Manage your product catalog" },
    "/admin/subscriptions": { title: "Subscriptions", icon: HiArrowPath, description: "Manage recurring billing and plans" },
    "/admin/accounts": { title: "Accounts", icon: HiBuildingOffice, description: "Manage connected accounts" },
    "/admin/coupons": { title: "Coupons", icon: HiTag, description: "Manage discounts and promotions" },
    "/admin/balance": { title: "Account Balance", icon: HiBanknotes, description: "View account balances" },
    "/admin/payouts": { title: "Payouts", icon: HiBanknotes, description: "Manage payout schedules" },
    "/admin/users": { title: "Users", icon: HiUsers, description: "Manage user accounts" },
    "/admin/users/create": { title: "Create User", icon: HiUsers, description: "Add new user to system" },
    "/admin/users/roles": { title: "Roles", icon: HiUsers, description: "Manage user roles" },
    "/admin/users/permissions": { title: "Master Permissions", icon: HiUsers, description: "Configure system permissions" },
    "/admin/addKey": { title: "API Keys", icon: HiCog, description: "Manage API configurations" },
    "/admin/reports": { title: "Reports", icon: HiDocumentChartBar, description: "Generate business reports" },
    "/admin/notifications": { title: "Notifications", icon: HiBell, description: "Latest system updates" }
  };

  return routes[pathname as keyof typeof routes] || {
    title: "Admin Panel", 
    icon: HiChartBar,
    description: "Manage your application"
  };
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title: customTitle,
  description: customDescription,
  icon: customIcon
}) => {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  const title = customTitle || pageInfo.title;
  const description = customDescription || pageInfo.description;
  const IconComponent = customIcon || pageInfo.icon;

  return (
    <div className="w-full">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <IconComponent className="h-6 w-6 text-primary-content" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-base-content">{title}</h1>
                <p className="text-base-content/70 text-sm mt-1">{description}</p>
              </div>
            </div>
            <AccountSelect />
          </div>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

