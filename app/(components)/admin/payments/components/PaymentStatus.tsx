interface PaymentStatusProps {
  readonly status: 'succeeded' | 'pending' | 'failed' | 'requires_payment_method' | string;
}

const statusStyles: { [key: string]: string } = {
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  requires_payment_method: 'bg-blue-100 text-blue-800',
};

const PaymentStatus = ({ status }: PaymentStatusProps) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())}
    </span>
  );
};

export default PaymentStatus;