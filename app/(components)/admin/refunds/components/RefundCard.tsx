import { StatusBadge, AmountDisplay } from "@/components";

interface RefundCardProps {
  readonly refund: any;
}

export default function RefundCard({ refund }: RefundCardProps) {
  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColors(refund.status)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-mono text-sm font-medium">
            {refund.stripeRefundId ? refund.stripeRefundId.slice(-8) : 'N/A'}
          </h3>
          <p className="text-xs opacity-75 font-mono">
            Charge: {refund.stripeChargeId ? refund.stripeChargeId.slice(-8) : 'N/A'}
          </p>
        </div>
        <StatusBadge status={refund.status || 'unknown'} variant="payment" />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-lg font-semibold">
          <AmountDisplay amount={refund.amount || 0} currency={refund.currency || 'usd'} />
        </div>
        <div className="text-sm opacity-75">
          Reason: {refund.reason?.replace(/_/g, ' ') || 'N/A'}
        </div>
        <div className="text-xs opacity-60">
          {refund.createdAt ? new Date(refund.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}