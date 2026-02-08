"use client";
import { lazy, Suspense } from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import PageFilters from "@/components/common/PageFilters";
import { LoadingState, AmountDisplay } from "@/components";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import DaisyTable from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { motion } from "framer-motion";
import { IoCube, IoSearch, IoEye, IoGrid, IoList, IoCheckmarkCircle, IoCloseCircle, IoImage, IoPencil } from "react-icons/io5";

export default function ProductsPage() {
  const token = useAuthStore((state) => state.token);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created:desc');
  const [view, setView] = useState('card');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<{ column: string; direction: string }>({ column: "created", direction: "descending" });

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (sort) params.append('sort', sort);
      if (year && year !== "all") params.append('year', year);
      if (month && month !== "all") params.append('month', month);

      const url = `http://localhost:3001/api/v1/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const productsArray = data?.data || [];
        setProducts(productsArray);
        setTotalCount(data?.totalCount || productsArray.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchProducts();
  }, [token, search, sort, year, month]);

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm text-gray-600">
          {row.id || 'N/A'}
        </span>
      )
    },
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {row.images?.[0] ? (
              <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <IoImage className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      key: "stripeProductId",
      label: "Stripe Product ID",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-mono text-sm text-gray-600 truncate max-w-xs block">
          {row.stripeProductId || 'N/A'}
        </span>
      )
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="font-semibold text-gray-900">
          {row.prices ? (
            <AmountDisplay amount={row.prices.unitAmount} currency={row.prices.currency} />
          ) : (
            'N/A'
          )}
        </span>
      )
    },
    {
      key: "interval",
      label: "Billing",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600 capitalize">
          {row.prices?.recurringInterval || 'one-time'}
        </span>
      )
    },
    {
      key: "currency",
      label: "Currency",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm font-medium text-gray-900 uppercase">
          {row.prices?.currency || 'N/A'}
        </span>
      )
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">
          {row.description || 'No description'}
        </span>
      )
    },
    {
      key: "active",
      label: "Status",
      sortable: true,
      render: (value: any, row: any) => getStatusBadge(row.prices?.active || false)
    },
    {
      key: "created",
      label: "Created",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: "updated",
      label: "Updated",
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-600">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-1 justify-center">
          <Button 
            variant="view" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="View product"
            leftIcon={<IoEye className="w-3 h-3" />}
          />
          <Button 
            variant="edit" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Edit product"
            leftIcon={<IoPencil className="w-3 h-3" />}
          />
        </div>
      )
    }
  ];

  const handleSortChange = useCallback((descriptor:{ column: string; direction: string }) => {
    setSortDescriptor(descriptor);
    const direction = descriptor.direction === "ascending" ? "asc" : "desc";
    setSort(`${descriptor.column}:${direction}`);
  }, []);

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <IoCheckmarkCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <IoCloseCircle className="w-3 h-3 mr-1" />
        Archived
      </span>
    );
  };

  const statsCards = [
    {
      title: "Total Products",
      value: products.length,
      icon: IoCube,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "from-blue-600 to-cyan-600"
    },
    {
      title: "Active Products",
      value: products.filter(p => p.prices?.active=== true).length,
      icon: IoCheckmarkCircle,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-600 to-green-600"
    },
    {
      title: "Total Prices",
      value: products.reduce((sum, p) => sum + (p.prices?.length || 0), 0),
      icon: IoImage,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-600 to-purple-600"
    },
    {
      title: "Average Price Count",
      value: products.length > 0 ? (products.reduce((sum, p) => sum + (p.prices?.length || 0), 0) / products.length).toFixed(1) : 0,
      icon: IoPencil,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      bgGradient: "from-orange-50 to-amber-50",
      iconBg: "from-orange-600 to-amber-600"
    }
  ];

  if (loading) return <LoadingState message="Loading products..." />;

  return (
    <div className="space-y-6">
      <PageFilters year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <Card variant="elevated">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
            {/* Filters on Left */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
              <Input
                label="Search Products"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              
              <Select
                label="Sort By"
                options={[
                  { value: "created:desc", label: "Newest First" },
                  { value: "created:asc", label: "Oldest First" },
                  { value: "name:asc", label: "Name A-Z" },
                  { value: "name:desc", label: "Name Z-A" }
                ]}
                value={sort}
                onChange={(value) => setSort(value.toString())}
                className="w-full"
              />
            </div>
            {/* View Mode on Right */}
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
            products.length === 0 && !loading ? (
              <EmptyState
                title="No data found"
                description="No products match your current filters."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card interactive variant="elevated" className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <IoImage className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono">
                                {product.id || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                          {product.description || 'No description available.'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">
                              {product.prices ? (
                                <AmountDisplay amount={product.prices.unitAmount} currency={product.prices.currency} />
                              ) : (
                                'N/A'
                              )}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {product.prices?.recurringInterval || 'one-time'}
                            </span>
                          </div>
                          {getStatusBadge(product.prices?.active || false)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="view" 
                            style="soft" 
                            size="sm" 
                            iconOnly
                            ariaLabel="View product"
                            leftIcon={<IoEye className="w-3 h-3" />}
                          />
                          <Button 
                            variant="edit" 
                            style="soft" 
                            size="sm" 
                            iconOnly
                            ariaLabel="Edit product"
                            leftIcon={<IoPencil className="w-3 h-3" />}
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
              data={products}
              loading={loading}
              emptyMessage="No products found"
              striped
              hoverable
              onSort={(key, direction) => {
                setSortDescriptor({ column: key, direction: direction === 'asc' ? 'ascending' : 'descending' });
                setSort(`${key}:${direction}`);
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
  );
}