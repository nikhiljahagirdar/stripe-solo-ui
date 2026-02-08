import React from 'react';

interface StatusBadgeProps {
  readonly status: string;
  readonly className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    if (!status) return 'badge-ghost';
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'badge-success text-white';
      case 'inactive':
      case 'canceled':
      case 'failed':
        return 'badge-error text-white';
      case 'pending':
      case 'processing':
      case 'incomplete':
        return 'badge-warning text-white';
      case 'suspended':
        return 'badge-error text-white';
      default:
        return 'badge-ghost';
    }
  };

  return (
    <span className={`badge ${getStatusColor(status)} gap-1 capitalize ${className}`}>
      {status}
    </span>
  );
}

export default StatusBadge;