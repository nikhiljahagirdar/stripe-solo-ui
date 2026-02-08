"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  IoAdd, 
  IoSearch, 
  IoChevronBack, 
  IoChevronForward,
  IoPeople,
  IoEye,
  IoPencil,
  IoFilter
} from "react-icons/io5";
import { StatusBadge } from "@/components/ui/StatusBadge";
import PageFilters from "@/components/common/PageFilters";

export default function CustomersPage() {
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  // State for customers data and loading status
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "created", direction: "descending" });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          period,
          sort: `${sortDescriptor.column}:${sortDescriptor.direction === "ascending" ? "asc" : "desc"}`,
        });
        
        if (searchQuery) params.append("query", searchQuery);
        
        if (statusFilter !== 'all') {
             params.append("filter[status]", statusFilter);
        }

           if (year && year !== "all") params.append("year", year);
           if (month && month !== "all") params.append("month", month);

        const response = await fetch(`http://localhost:3001/api/v1/customers?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const list = data.data || (Array.isArray(data) ? data : []);
          setCustomers(list);
          setTotalCount(data.totalCount || list.length);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, pageSize, searchQuery, period, statusFilter, sortDescriptor, year, month]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer base and view insights.</p>
        </div>
        <Link href="/admin/customers/new">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            
          <IoAdd  />  Add Customer
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalCount}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoSearch className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Now</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">-</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">New This Month</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">-</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <IoAdd className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 w-full md:max-w-md">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 transition-colors">
                <IoFilter className="text-gray-400" />
                <select 
                    className="bg-transparent outline-none text-sm text-gray-600"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <select 
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setPage(1);
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
         <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id || customer.stripeCustomerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status || 'active'} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${((customer.totalSpent || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {customer.created ? new Date(customer.created).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/customers/${customer.id || customer.stripeCustomerId}`}>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <IoEye className="h-4 w-4" />
                            </button>
                        </Link>
                        <Link href={`/admin/customers/${customer.id || customer.stripeCustomerId}/edit`}>
                            <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                <IoPencil className="h-4 w-4" />
                            </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table> 
        </div>

        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="p-4 border-t bg-gray-50/50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium text-gray-600 transition-colors bg-white shadow-sm"
              >
                <IoChevronBack className="mr-1 h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium text-gray-600 transition-colors bg-white shadow-sm"
              >
                Next <IoChevronForward className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for DaisyTable or Card View */}
        <div className="text-center py-12">
          <IoPeople className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Table or Card view will go here.</p>
        </div>
      </div>
    </div>
  );
}