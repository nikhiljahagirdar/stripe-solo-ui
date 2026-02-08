interface AmountDisplayProps {
  readonly amount: number;
  readonly currency?: string;
  readonly showSign?: boolean;
  readonly className?: string;
}

export default function AmountDisplay({ amount, currency = 'USD', showSign = false, className = '' }: AmountDisplayProps) {
  const formatAmount = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(value / 100); // Assuming amount is in cents
  };

  const getColorClass = () => {
    if (!showSign) return '';
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSignPrefix = () => {
    if (!showSign) return '';
    if (amount > 0) return '+';
    return '';
  };

  return (
    <span className={`font-medium ${getColorClass()} ${className}`}>
      {getSignPrefix()}{formatAmount(Math.abs(amount))}
    </span>
  );
}