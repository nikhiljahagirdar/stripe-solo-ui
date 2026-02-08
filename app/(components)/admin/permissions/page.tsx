"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import { Button, LoadingState } from "@/components";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ShieldCheckIcon, PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, DocumentIcon, KeyIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function RolesPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const pages = [
    { name: 'Dashboard', api: '/api/dashboard' },
    { name: 'Customers', api: '/api/customers' },
    { name: 'Users', api: '/api/users' },
    { name: 'Roles', api: '/api/roles' },
    { name: 'Products', api: '/api/products' },
    { name: 'Payments', api: '/api/payments' },
    { name: 'Analytics', api: '/api/analytics' },
    { name: 'Settings', api: '/api/settings' }
  ];

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/roles', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (jsonError) {
            console.error('Invalid JSON response from roles API:', text);
            return [];
          }
        }),
        fetch('http://localhost:3001/api/v1/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (jsonError) {
            console.error('Invalid JSON response from users API:', text);
            return { data: [] };
          }
        })
      ]);
      setRoles(rolesRes || []);
      setUsers(usersRes.data || []);
      
      // Initialize permissions for each page
      const initialPermissions = pages.map(page => ({
        page: page.name,
        api: page.api,
        isCreate: false,
        isRead: false,
        isUpdate: false,
        isDelete: false
      }));
      setPermissions(initialPermissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error
      setRoles([]);
      setUsers([]);
      setPermissions(pages.map(page => ({
        page: page.name,
        api: page.api,
        isCreate: false,
        isRead: false,
        isUpdate: false,
        isDelete: false
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const res = await fetch('http://localhost:3001/api/v1/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newRoleName })
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error creating role:', text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      setNewRoleName("");
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/v1/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Error deleting role:', text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handlePermissionChange = (pageIndex: number, permission: string, value: boolean) => {
    setPermissions(prev => prev.map((p, i) => 
      i === pageIndex ? { ...p, [permission]: value } : p
    ));
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [token]);

  // Stats cards data
  const statsCards = [
    {
      title: "Total Roles",
      value: roles.length,
      icon: ShieldCheckIcon,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-500 to-purple-500"
    },
    {
      title: "Total Users",
      value: users.length,
      icon: UserGroupIcon,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-500 to-green-500"
    },
    {
      title: "Page Permissions",
      value: pages.length,
      icon: DocumentIcon,
      gradient: "from-blue-500 via-cyan-500 to-sky-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-500 to-cyan-500"
    }
  ];

  if (loading) return <LoadingState message="Loading roles..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2" />
            Roles & Permissions
          </h1>
          <p className="text-gray-600">Manage user roles and access control</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Role
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

      {/* User and Role Selection */}
      <Card variant="elevated">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Select User"
                value={selectedUser}
                onChange={(val) => setSelectedUser(String(val))}
                options={users.map((user: any) => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`
                }))}
              />
            </div>
            <div>
              <Select
                label="Select Role"
                value={selectedRole}
                onChange={(val) => setSelectedRole(String(val))}
                options={roles.map((role: any) => ({
                  value: role.id,
                  label: role.name
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card variant="elevated">
          <CardContent className="p-6">
            <form onSubmit={handleCreateRole} className="flex items-center space-x-4">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button type="submit">Create</Button>
              <Button
                type="button"
                variant="neutral"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRoleName("");
                }}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Permissions Grid */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle size="lg">Page Permissions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {pages.map((page, pageIndex) => (
              <div key={page.name} className="p-4 border-b-1 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  
                </div>
                <div className="grid  md:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{page.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions[pageIndex]?.isRead || false}
                      onChange={(e) => handlePermissionChange(pageIndex, 'isRead', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Read</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions[pageIndex]?.isCreate || false}
                      onChange={(e) => handlePermissionChange(pageIndex, 'isCreate', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Create</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions[pageIndex]?.isUpdate || false}
                      onChange={(e) => handlePermissionChange(pageIndex, 'isUpdate', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Update</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions[pageIndex]?.isDelete || false}
                      onChange={(e) => handlePermissionChange(pageIndex, 'isDelete', e.target.checked)}
                      className="h-4 w-4 text-red-600 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Delete</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button className="w-full">Save Permissions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}