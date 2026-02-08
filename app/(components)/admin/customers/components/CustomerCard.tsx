import Link from "next/link";
import { StatusBadge } from "@/components";
import { IoEye, IoPencil } from "react-icons/io5";
import { Button } from "@/components/ui/Button";

interface Customer {
  id: number;
  userId: number;
  stripeAccountId: number;
  stripeCustomerId: string;
  email: string;
  name: string;
  status?: string;
  liveMode: boolean;
  created: number;
  createdAt: string;
  updatedAt: string;
  totalSpent: number;
}

interface CustomerCardProps {
  readonly customer: Customer;
  readonly onView?: () => void;
  readonly onEdit?: () => void;
}

export default function CustomerCard({ customer, onView, onEdit }: CustomerCardProps) {
  const customerId = customer.id || customer.stripeCustomerId;
  
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{customer.name || 'N/A'}</h3>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <StatusBadge status={customer.status || 'active'} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-500">Total Spent: </span>
          <span className="font-medium">${(customer.totalSpent || 0).toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-500">
          Created: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {onView ? (
          <button 
            onClick={onView}
            className="flex-1 px-3 py-2 h-8 w-8 bg-green-100 text-green-600 hover:bg-green-200 rounded-md transition-colors text-sm flex items-center justify-center"
          >
            <IoEye className="h-4 w-4 inline mr-1" />
            View
          </button>
        ) : (
          <Link href={`/admin/customers/${customerId}`} className="flex-1">
            <button className="w-full h-8 w-8 px-3 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-md transition-colors text-sm">
              <IoEye className="h-4 w-4 inline mr-1" />
              View
            </button>
          </Link>
        )}
        <div className="flex justify-end">
           {onEdit ? (
          <Button 
            onClick={onEdit}
            variant="edit"
            style="soft"
            size="sm"
            iconOnly
            ariaLabel="Edit customer"
            leftIcon={<IoPencil className="h-4 w-4" />}
          />
        ) : (
          <Link href={`/admin/customers/${customerId}/edit`} className="flex-1">
            <Button 
              variant="edit" 
              style="soft" 
              size="sm" 
              iconOnly
              ariaLabel="Edit customer"
              leftIcon={<IoPencil className="h-4 w-4" />}
            />
          </Link>
        )}
        </div>
       
      </div>
    </div>
  );
}