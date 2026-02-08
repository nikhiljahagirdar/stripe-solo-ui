"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import RolesTable from './components/RolesTable';
import RoleForm from './components/RoleForm';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import DashboardHeader from '@/components/ui/DashboardHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/common/EmptyState';
import { PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { IoGrid, IoList, IoSearch, IoPencil, IoTrash } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AuthGuard from '@/components/auth/AuthGuard';

export default function RolesPage() {
  const token = useAuthStore((state) => state.token);
  const [roles, setRoles] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<any>(null);
  const [view, setView] = useState<'card' | 'table'>('table');
  const [search, setSearch] = useState('');

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(search.toLowerCase()));

  const fetchRoles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getRoles(token);
      setRoles(data?.data || []);
      setPagination(prev => ({ 
        ...prev, 
        totalPages: data?.pagination?.totalPages || 1,
        totalCount: data?.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to fetch roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleOpenForm = (role: any = null) => {
    setRoleToEdit(role);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setRoleToEdit(null);
  };

  const handleSaveRole = async (role: { id?: number; name: string }) => {
    setLoading(true);
    try {
      if (role.id) {
        if (token) await api.updateRole(token, role.id, { name: role.name });
        toast.success("Role updated successfully!");
      } else {
        if (token) await api.createRole(token, { name: role.name });
        toast.success("Role created successfully!");
      }
      fetchRoles(); // Re-fetch roles to show the changes
      handleCloseForm();
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error("Failed to save role.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role: { id: number }) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      // TODO: Implement api.deleteRole(token, role.id)
      toast.success(`Role ${role.id} deleted.`);
    }
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Total Roles",
      value: pagination.totalCount,
      icon: ShieldCheckIcon,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-500 to-purple-500"
    },
    {
      title: "Active Roles",
      value: roles.length,
      icon: ShieldCheckIcon,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-500 to-green-500"
    },
    {
      title: "Page",
      value: pagination.currentPage,
      icon: PlusIcon,
      gradient: "from-orange-500 via-orange-500 to-orange-500",
      bgGradient: "from-orange-50 to-orange-50",
      iconBg: "from-orange-500 to-orange-500"
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-8">
          {/* Header */}
          <DashboardHeader
            title="Role Management"
            description="Manage user roles and permissions across your organization"
            icon={ShieldCheckIcon}
            stats={[
              {
                label: "Total Roles",
                value: pagination.totalCount.toString(),
                change: "+2 this month",
                trend: "up"
              },
              {
                label: "Active Roles",
                value: roles.length.toString(),
                change: "All active",
                trend: "up"
              }
            ]}
          >
            <Button 
              variant="success" 
              style="solid"
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Role
            </Button>
          </DashboardHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Roles"
              value={pagination.totalCount}
              change="+12.5%"
              trend="up"
              icon={ShieldCheckIcon}
              gradient="customers"
            />
            <StatCard
              title="Active Roles"
              value={roles.length}
              change="100%"
              trend="up"
              icon={ShieldCheckIcon}
              gradient="success"
            />
            <StatCard
              title="Current Page"
              value={pagination.currentPage}
              change="of 1"
              trend="neutral"
              icon={PlusIcon}
              gradient="default"
            />
          </div>

          {/* Filters & Content */}
          <Card variant="elevated">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Input
                  label="Search Roles"
                  placeholder="Search by role name..."
                  leftIcon={<IoSearch className="text-gray-400" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64"
                />
                
                <div className="flex items-end justify-end">
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-fit">
                    <button
                      onClick={() => setView('card')}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        view === 'card'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                      }`}
                    >
                      <IoGrid className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setView('table')}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        view === 'table'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                      }`}
                    >
                      <IoList className="w-4 h-4 mr-1" />
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {view === 'card' && (
                filteredRoles.length === 0 && !loading ? (
                  <EmptyState
                    title="No data found"
                    description="No roles match your current filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card interactive variant="elevated" className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                                <ShieldCheckIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                                  {role.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {role.id}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="edit" 
                              style="soft" 
                              size="sm" 
                              iconOnly
                              ariaLabel="Edit role"
                              leftIcon={<IoPencil className="w-3 h-3" />}
                              onClick={() => handleOpenForm(role)}
                            />
                            <Button 
                              variant="delete" 
                              style="soft" 
                              size="sm" 
                              iconOnly
                              ariaLabel="Delete role"
                              leftIcon={<IoTrash className="w-3 h-3" />}
                              onClick={() => handleDeleteRole(role)}
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
                <RolesTable 
                  roles={filteredRoles} 
                  loading={loading} 
                  pagination={pagination} 
                  onPageChange={handlePageChange} 
                  onEdit={handleOpenForm} 
                  onDelete={handleDeleteRole} 
                />
              )}
            </CardContent>
          </Card>

        <RoleForm isOpen={isFormOpen} onClose={handleCloseForm} onSave={handleSaveRole} roleToEdit={roleToEdit} loading={loading} />
      </div>
    </AuthGuard>
  );
}