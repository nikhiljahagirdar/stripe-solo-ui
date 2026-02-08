"use client";

import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RolesTableProps {
  readonly roles: any[];
  readonly loading: boolean;
  readonly pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  readonly onPageChange: (page: number) => void;
  readonly onEdit: (role: any) => void;
  readonly onDelete: (role: any) => void;
}

const RolesTable = ({ roles, loading, pagination, onPageChange, onEdit, onDelete }: RolesTableProps) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Role Name', render: (name: string) => <span className="font-semibold">{name}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-end space-x-2">
          <Button 
            variant="edit" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Edit role"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(row)}
          />
          <Button 
            variant="delete" 
            style="soft" 
            size="sm" 
            iconOnly
            ariaLabel="Delete role"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            onClick={() => onDelete(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Table columns={columns} data={roles} loading={loading} emptyMessage="No roles found." />
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

export default RolesTable;