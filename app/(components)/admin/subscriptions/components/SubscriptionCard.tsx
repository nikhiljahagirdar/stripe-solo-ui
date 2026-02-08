import { StatusBadge, AmountDisplay } from "@/components";
import { RectangleStackIcon } from "@heroicons/react/24/outline";

interface SubscriptionCardProps {
  readonly subscription: any;
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'trialing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'past_due':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'canceled':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'unpaid':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColors(subscription.status)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <RectangleStackIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{subscription.product?.name || 'N/A'}</h3>
            <p className="text-xs text-gray-500 font-mono">
              {subscription.stripeSubscriptionId?.slice(-8) || 'N/A'}
            </p>
          </div>
        </div>
        <StatusBadge status={subscription.status || 'unknown'} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-600">Customer: </span>
          <span className="font-medium">{subscription.customer?.name || 'N/A'}</span>
        </div>
        <div className="text-sm text-gray-600">
          {subscription.customer?.email || ''}
        </div>
        
        <div className="text-lg font-semibold">
          <AmountDisplay 
            amount={subscription.price?.unitAmount || 0} 
            currency={subscription.price?.currency || 'usd'} 
          />
          <span className="text-sm font-normal text-gray-500 ml-1">
            /{subscription.price?.recurringInterval || 'month'}
          </span>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-600">Quantity: </span>
          <span className="font-medium">{subscription.quantity || 1}</span>
        </div>
      </div>
      
      <div className="border-t pt-3 space-y-1">
        <div className="text-xs text-gray-500">
          Current Period: {subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart).toLocaleDateString() : 'N/A'} - {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
        </div>
        <div className="text-xs text-gray-500">
          Next Billing: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}