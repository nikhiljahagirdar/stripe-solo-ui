"use client";

import { useState } from "react";

interface FiltersProps {
  readonly onFiltersChange: (filters: any) => void;
}

export default function AnalyticsFilters({ onFiltersChange }: FiltersProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [status, setStatus] = useState("all");
  const [accountId, setAccountId] = useState("");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handleFilterChange = () => {
    const filters = {
      dateRange: showCustomDate ? 'custom' : dateRange,
      status,
      accountId,
      customDateFrom: showCustomDate ? customDateFrom : '',
      customDateTo: showCustomDate ? customDateTo : ''
    };
    onFiltersChange(filters);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setShowCustomDate(value === 'custom');
    setTimeout(() => {
      const filters = {
        dateRange: value === 'custom' ? 'custom' : value,
        status,
        accountId,
        customDateFrom: value === 'custom' ? customDateFrom : '',
        customDateTo: value === 'custom' ? customDateTo : ''
      };
      onFiltersChange(filters);
    }, 0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setTimeout(() => {
      const filters = {
        dateRange: showCustomDate ? 'custom' : dateRange,
        status: value,
        accountId,
        customDateFrom: showCustomDate ? customDateFrom : '',
        customDateTo: showCustomDate ? customDateTo : ''
      };
      onFiltersChange(filters);
    }, 0);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Analytics Filters</h2>
        <button 
          onClick={() => {
            setDateRange("30d");
            setStatus("all");
            setAccountId("");
            setCustomDateFrom("");
            setCustomDateTo("");
            setShowCustomDate(false);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select title="Date Range"
            value={dateRange} 
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select title="Payment Status"
            value={status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="requires_payment_method">Requires Payment</option>
          </select>
        </div>
        

        
        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Active Filters: </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {dateRange === 'custom' ? 'Custom' : dateRange}
            </span>
            {status !== 'all' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1">
                {status}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showCustomDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input 
              title="From Date"
              placeholder="Select From Date"
              type="date" 
              value={customDateFrom}
              onChange={(e) => {
                setCustomDateFrom(e.target.value);
                setTimeout(handleFilterChange, 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input 
              title="To Date"
              placeholder="Select To Date"
              value={customDateTo}
              onChange={(e) => {
                setCustomDateTo(e.target.value);
                setTimeout(handleFilterChange, 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}