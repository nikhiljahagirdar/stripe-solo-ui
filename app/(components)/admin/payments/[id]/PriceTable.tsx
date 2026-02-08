"use client";

import { Table, Button } from '@/components';
import { PencilIcon } from '@heroicons/react/24/outline';

interface PriceTableProps {
  readonly prices: any[];
  readonly loading: boolean;
}

const PriceTable = ({ prices, loading }: PriceTableProps) => {
  const columns = [
    { key: 'nickname', header: 'Nickname', render: (name: string) => name || 'N/A' },
    { key: 'unit_amount', header: 'Amount', render: (amount: number, row: any) => `$${(amount / 100).toFixed(2)} ${row.currency.toUpperCase()}` },
    { key: 'type', header: 'Type', render: (type: string) => <span className="capitalize">{type}</span> },
    { key: 'recurring', header: 'Billing Period', render: (recurring: any) => recurring ? `every ${recurring.interval_count > 1 ? recurring.interval_count : ''} ${recurring.interval}${recurring.interval_count > 1 ? 's' : ''}` : 'One-time' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          {/* TODO: Add edit price functionality */}
          <Button variant="neutral" size="sm" disabled><PencilIcon className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ] as any;

  return <Table columns={columns} data={prices} loading={loading} emptyMessage="No prices found for this product." />;
};

export default PriceTable;