import Link from "next/link";
import { StatusBadge } from "@/components";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";

interface InvoiceCardProps {
  readonly invoice: any;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{invoice.number || 'N/A'}</h3>
          <p className="text-sm text-gray-500">{invoice.customer_name || 'Unknown Customer'}</p>
        </div>
        <StatusBadge status={invoice.status || 'unknown'} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-500">Amount: </span>
          <span className="font-medium">${((invoice.total || 0) / 100).toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-500">
          Due: {invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link href={`/admin/invoices/${invoice.id}`} className="flex-1">
          <button className="w-full px-3 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-md transition-colors text-sm">
            <EyeIcon className="h-4 w-4 inline mr-1" />
            View
          </button>
        </Link>
        <Link href={`/admin/invoices/${invoice.id}/edit`} className="flex-1">
          <button className="w-full px-3 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-md transition-colors text-sm">
            <PencilIcon className="h-4 w-4 inline mr-1" />
            Edit
          </button>
        </Link>
      </div>
    </div>
  );
}