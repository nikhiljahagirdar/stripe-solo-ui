"use client";

import { useState } from "react";
import { IoFilter, IoCalendar, IoCard, IoBusiness } from "react-icons/io5";

interface FiltersProps {
  readonly onFiltersChange: (filters: any) => void;
  readonly accounts?: any[];
}

export default function AnalyticsFilters({ onFiltersChange, accounts = [] }: FiltersProps) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [accountId, setAccountId] = useState("all");

  const handleFilterChange = (updates: any) => {
    const newFilters = {
      year,
      month,
      status,
      accountId: accountId === "all" ? "" : accountId,
      ...updates
    };
    onFiltersChange(newFilters);
  };

  const years = ["2023", "2024", "2025", "2026"];
  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <IoFilter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold">Analytics Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <IoBusiness className="text-gray-400" />
            Account
          </label>
          <select title="Account"
            value={accountId} 
            onChange={(e) => {
              setAccountId(e.target.value);
              handleFilterChange({ accountId: e.target.value });
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.stripeAccountId || acc.id}>
                {acc.id} ({acc.country})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <IoCalendar className="text-gray-400" />
            Year
          </label>
          <select title="Year"
            value={year} 
            onChange={(e) => {
              setYear(e.target.value);
              handleFilterChange({ year: e.target.value });
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          >
            <option value="all">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <IoCalendar className="text-gray-400" />
            Month
          </label>
          <select title="Month"
            value={month} 
            onChange={(e) => {
              setMonth(e.target.value);
              handleFilterChange({ month: e.target.value });
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <IoCard className="text-gray-400" />
            Status
          </label>
          <select title="Payment Status"
            value={status} 
            onChange={(e) => {
              setStatus(e.target.value);
              handleFilterChange({ status: e.target.value });
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="requires_payment_method">Requires Payment</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
        <div className="flex gap-2">
          {accountId !== 'all' && (
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
              Account Active
            </span>
          )}
          {year !== 'all' && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
              Year: {year}
            </span>
          )}
          {month !== 'all' && (
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
              Month: {months.find(m => m.value === month)?.label}
            </span>
          )}
          {status !== 'all' && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
              Status: {status}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => {
            const defaultYear = new Date().getFullYear().toString();
            setYear(defaultYear);
            setMonth("all");
            setStatus("all");
            setAccountId("all");
            onFiltersChange({
              year: defaultYear,
              month: "all",
              status: "all",
              accountId: ""
            });
          }}
          className="text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}