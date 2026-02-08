"use client";

import { Table, Button } from '@/components';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProductTableProps {
  readonly products: any[];
  readonly loading: boolean;
  readonly pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  readonly onPageChange: (page: number) => void;
}

const ProductTable = ({ products, loading, pagination, onPageChange }: ProductTableProps) => {
  const columns = [
    { key: 'name', header: 'Product Name', render: (name: string, row: any) => <Link href={`/products/${row.id}`} className="font-semibold text-blue-600 hover:underline">{name}</Link> },
    { key: 'description', header: 'Description', render: (desc: string) => <span className="text-sm text-gray-600">{desc || 'N/A'}</span> },
    { key: 'active', header: 'Status', render: (active: boolean) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{active ? 'Active' : 'Inactive'}</span> },
    { key: 'created', header: 'Created', render: (date: number) => new Date(date * 1000).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Link href={`/products/${row.id}`}>
            <Button variant="neutral" size="sm"><EyeIcon className="h-4 w-4" /></Button>
          </Link>
          <Link href={`/products/${row.id}/edit`}>
            <Button variant="neutral" size="sm"><PencilIcon className="h-4 w-4" /></Button>
          </Link>
        </div>
      ),
    },
  ] as any;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table columns={columns} data={products} loading={loading} emptyMessage="No products found." />
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalCount)}</span> of{' '}
              <span className="font-medium">{pagination.totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;