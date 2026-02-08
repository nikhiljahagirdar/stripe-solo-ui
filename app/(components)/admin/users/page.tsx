"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState } from "@/components";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import{ Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import DaisyTable from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { motion } from "framer-motion";
import { 
  IoPerson, 
  IoPencil,
  IoGrid, 
  IoList, 
  IoPeople,
  IoPersonAdd,
  IoTrash,
  IoShieldCheckmark,
  IoSearch
} from "react-icons/io5";

interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: string | { id: number; name: string };
  status: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
}

const statusOptions = [
  {key: "all", label: "All Status"},
  {key: "active", label: "Active"},
  {key: "inactive", label: "Inactive"},
  {key: "suspended", label: "Suspended"},
];

const roleOptions = [
  {key: "all", label: "All Roles"},
  {key: "admin", label: "Admin"},
  {key: "manager", label: "Manager"},
  {key: "user", label: "User"},
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [view, setView] = useState<'card' | 'table'>('card');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "createdAt", direction: "descending" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (search) params.append("query", search);
      if (statusFilter !== 'all') params.append("status", statusFilter);
      if (roleFilter !== 'all') params.append("role", roleFilter);
      if (year && year !== "all") params.append("year", year);
      if (month && month !== "all") params.append("month", month);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
            setUsers(data.data);
            setTotalCount(data.totalCount || data.pagination?.totalCount || 0);
        } else {
            setUsers([]);
            setTotalCount(0);
        }
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, roleFilter, token, year, month]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const handleSortChange = useCallback((descriptor: any) => {
    setSortDescriptor(descriptor);
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) fetchUsers();
      else alert('Failed to delete user');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const columns = [
    { 
      key: "name", 
      label: "User", 
      sortable: true,
      render: (value: any, user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
          <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
        </div>
      )
    },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any, user: User) => (
        <span className="capitalize text-sm text-gray-700">
          {typeof user.role === 'string' ? user.role : user.role?.name || 'Unknown'}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: any, user: User) => <StatusBadge status={user.status} />
    },
    { 
      key: "createdAt", 
      label: "Created", 
      sortable: true,
      render: (value: any, user: User) => (
        <span className="text-gray-500 text-sm">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: "actions", 
      label: "Actions", 
      align: "center",
      render: (value: any, user: User) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="edit" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Edit user"
            leftIcon={<IoPencil className="w-3 h-3" />}
            onClick={() => {/* Edit logic */}}
          />
          <Button 
            variant="delete" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Delete user"
            leftIcon={<IoTrash className="w-3 h-3" />}
            onClick={() => handleDeleteUser(user.id.toString())}
          />
        </div>
      )
    },
  ];

  const statsCards = [
    {
      title: "Total Users",
      value: totalCount,
      icon: IoPeople,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-600 to-cyan-600"
    },
    {
      title: "Active Users",
      // Approximation if not provided by API
      value: users.filter(u => u.status === 'active').length, 
      icon: IoPerson,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-600 to-green-600"
    },
    {
      title: "Admins",
      value: users.filter(u => typeof u.role === 'string' ? u.role === 'admin' : u.role?.name === 'Admin').length,
      icon: IoShieldCheckmark,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    }
  ];

  if (loading && users.length === 0) return <LoadingState message="Loading users..." />;

  return (
    <div className="space-y-6 p-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           {/* Title could go here if needed, but CustomersPage has empty div */}
        </div>
        <Button 
          variant="success" 
          style="solid"
          onClick={() => {/* Add create user logic */}}
          leftIcon={<IoPersonAdd className="h-4 w-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {stat.value.toLocaleString()}
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

      {/* Filters & Content */}
      <Card className="border-none shadow-md bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label=" Name/Email"
              placeholder="Search users..."
              leftIcon={<IoSearch className="text-gray-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value || 'all')}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
            
            <Select
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value || 'all')}
              options={[
                { value: 'all', label: 'All' },
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'moderator', label: 'Moderator' }
              ]}
            />

            <div className="flex items-end justify-end">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
                <button
                  onClick={() => setView('card')}
                  className={`flex items-center px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                    view === 'card'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-violet-50'
                  }`}
                >
                  <IoGrid className="w-4 h-4 mr-1" />
                  Cards
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                    view === 'table'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-violet-50'
                  }`}
                >
                  <IoList className="w-4 h-4 mr-1" />
                  Table
                </button>
              </div>
            </div>
          </div>

          {view === 'card' && (
          users.length === 0 && !loading ? (
            <EmptyState
              title="No data found"
              description="No users match your current filters."
            />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-2xl bg-white shadow-xl hover-lift border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content w-10 rounded-full">
                            <span className="text-xs">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{user.firstName} {user.lastName}</div>
                          <div className="text-xs opacity-50">{user.email}</div>
                        </div>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <span className="font-medium capitalize">
                          {typeof user.role === 'string' ? user.role : user.role?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="edit" 
                        style="soft" 
                        size="sm" 
                        iconOnly
                        ariaLabel="Edit user"
                        leftIcon={<IoPencil className="w-3 h-3" />}
                        onClick={() => {/* Edit user */}}
                      />
                      <Button 
                        variant="delete" 
                        style="soft" 
                        size="sm" 
                        iconOnly
                        ariaLabel="Delete user"
                        leftIcon={<IoTrash className="w-3 h-3" />}
                        onClick={() => handleDeleteUser(user.id.toString())}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )
        )}
        {view === 'table' && (
          <DaisyTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found"
            striped
            hoverable
            onSort={(key, direction) => {
              setSortDescriptor({ column: key, direction: direction === 'asc' ? 'ascending' : 'descending' });
            }}
            sortKey={sortDescriptor.column}
            sortDirection={sortDescriptor.direction === 'ascending' ? 'asc' : 'desc'}
          />
        )}
      </CardContent>
    </Card>

    {/* Pagination */}
    {totalCount > pageSize && (
      <div className="mt-6 flex justify-center">
        <Pagination 
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={setPage}
        />
      </div>
    )}
  </div>
)
}