"use client";

import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import SubscriptionStatus from './SubscriptionStatus';

interface SubscriptionTableProps {
  readonly subscriptions: any[];
  readonly loading: boolean;
  readonly pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  readonly onPageChange: (page: number) => void;
}

const SubscriptionTable = ({ subscriptions, loading, pagination, onPageChange }: SubscriptionTableProps) => {
  const columns = [
    { key: 'id', label: 'ID', render: (id: string) => <Link href={`/subscriptions/${id}`} className="font-mono text-sm text-blue-600 hover:underline">{id}</Link> },
    { key: 'customer', label: 'Customer ID', render: (id: string) => <span className="font-mono text-sm">{id}</span> },
    { key: 'status', label: 'Status', render: (status: string) => <SubscriptionStatus status={status} /> },
    { key: 'current_period_end', label: 'Next Billing', render: (date: number) => new Date(date * 1000).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <Link href={`/subscriptions/${row.id}`}>
          <Button variant="view" size="sm" leftIcon={<EyeIcon className="h-4 w-4" />}>
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table columns={columns} data={subscriptions} loading={loading} emptyMessage="No subscriptions found." />
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

export default SubscriptionTable;