import { ReactNode } from 'react';
import { cn } from "@/lib/utils";
import { ModernSpinner } from './ModernSpinner';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps {
  readonly columns: Column[];
  readonly data: any[];
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly striped?: boolean;
  readonly hoverable?: boolean;
  readonly className?: string;
  readonly onSort?: (key: string, direction: 'asc' | 'desc') => void;
  readonly sortKey?: string;
  readonly sortDirection?: 'asc' | 'desc';
}

const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | null }) => {
  if (!direction) {
    return (
      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  return (
    <svg 
      className={cn(
        "w-4 h-4 transition-colors",
        direction === 'asc' ? "text-primary-500" : "text-primary-500 rotate-180"
      )} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
};

export default function Table({ 
  columns, 
  data, 
  loading, 
  emptyMessage = 'No data available', 
  striped = false,
  hoverable = true,
  className,
  onSort,
  sortKey,
  sortDirection,
}: TableProps) {

  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return;
    
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortKey === column.key && sortDirection === 'asc') {
      newDirection = 'desc';
    }
    
    onSort(column.key, newDirection);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 bg-white rounded-2xl border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
        <ModernSpinner size="lg" variant="dots" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className={cn("w-full", className)}>
          <thead className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={cn(
                    "h-14 px-6 text-left align-middle font-semibold text-neutral-700 dark:text-neutral-300 transition-colors",
                    column.sortable && onSort && "hover:text-primary-500 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <SortIcon 
                        direction={sortKey === column.key ? (sortDirection as 'asc' | 'desc' | null) : null} 
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500 dark:text-neutral-400">
                    <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={index} 
                  className={cn(
                    "transition-colors",
                    striped && index % 2 !== 0 && "bg-neutral-50/30 dark:bg-neutral-800/30",
                    hoverable && "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className="p-4 align-middle text-neutral-900 dark:text-neutral-100"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table footer with count */}
      {data.length > 0 && (
        <div className="px-6 py-3 bg-neutral-50/50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {data.length} {data.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      )}
    </div>
  );
}