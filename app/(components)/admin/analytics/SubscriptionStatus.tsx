interface SubscriptionStatusProps {
  readonly status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | string;
}

const statusStyles: { [key: string]: string } = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-sky-100 text-sky-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  unpaid: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
  incomplete: 'bg-orange-100 text-orange-800',
  incomplete_expired: 'bg-red-100 text-red-800',
};

const SubscriptionStatus = ({ status }: SubscriptionStatusProps) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
    </span>
  );
};

export default SubscriptionStatus;