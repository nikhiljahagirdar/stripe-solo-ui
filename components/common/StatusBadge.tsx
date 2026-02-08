interface StatusBadgeProps {
  readonly status: string;
  readonly variant?: 'default' | 'payment' | 'subscription';
}

export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (!status) return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    const normalizedStatus = status.toLowerCase();
    
    if (variant === 'payment') {
      switch (normalizedStatus) {
        case 'succeeded':
        case 'paid':
          return { color: 'bg-green-100 text-green-800', label: 'Succeeded' };
        case 'failed':
        case 'declined':
          return { color: 'bg-red-100 text-red-800', label: 'Failed' };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
        case 'requires_payment_method':
          return { color: 'bg-orange-100 text-orange-800', label: 'Requires Payment' };
        case 'canceled':
          return { color: 'bg-gray-100 text-gray-800', label: 'Canceled' };
        default:
          return { color: 'bg-gray-100 text-gray-800', label: status };
      }
    }
    
    if (variant === 'subscription') {
      switch (normalizedStatus) {
        case 'active':
          return { color: 'bg-green-100 text-green-800', label: 'Active' };
        case 'canceled':
        case 'cancelled':
          return { color: 'bg-red-100 text-red-800', label: 'Canceled' };
        case 'past_due':
          return { color: 'bg-yellow-100 text-yellow-800', label: 'Past Due' };
        case 'unpaid':
          return { color: 'bg-red-100 text-red-800', label: 'Unpaid' };
        case 'trialing':
          return { color: 'bg-blue-100 text-blue-800', label: 'Trial' };
        default:
          return { color: 'bg-gray-100 text-gray-800', label: status };
      }
    }
    
    // Default variant
    switch (normalizedStatus) {
      case 'active':
      case 'enabled':
      case 'success':
        return { color: 'bg-green-100 text-green-800', label: status };
      case 'inactive':
      case 'disabled':
      case 'error':
        return { color: 'bg-red-100 text-red-800', label: status };
      case 'pending':
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800', label: status };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const { color, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}