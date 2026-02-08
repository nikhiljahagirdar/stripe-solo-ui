import { Table } from '@/components';
import PaymentStatus from './PaymentStatus';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface PaymentTableProps {
  readonly payments: any[]; // Replace with StripeCharge[] or PaymentIntent[]
  readonly loading: boolean;
  readonly pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  readonly onPageChange: (page: number) => void;
}

const PaymentTable = ({ payments, loading, pagination, onPageChange }: PaymentTableProps) => {
  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (id: string) => <Link href={`/payments/${id}`} className="text-blue-600 hover:underline font-mono text-sm">{id}</Link>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (amount: number, row: any) => `$${(amount / 100).toFixed(2)} ${row.currency.toUpperCase()}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (status: string) => <PaymentStatus status={status} />
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (customer: string) => <span className="font-mono text-sm">{customer || 'N/A'}</span>
    },
    { key: 'created', header: 'Date', render: (date: number) => new Date(date * 1000).toLocaleDateString() },
  ] as any;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * 25 + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * 25, pagination.totalCount)}</span> of{' '}
              <span className="font-medium">{pagination.totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Current page number can be added here if needed */}
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTable;