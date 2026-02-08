import { CreditCardIcon } from '@heroicons/react/24/solid';

interface PaymentMethodCardProps {
  readonly method: any; // Replace with StripePaymentMethod type
}

const PaymentMethodCard = ({ method }: PaymentMethodCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-4">
      <CreditCardIcon className="h-8 w-8 text-gray-400" />
      <div>
        <p className="font-semibold capitalize">{method.card?.brand} **** {method.card?.last4}</p>
        <p className="text-sm text-gray-500">
          Expires {method.card?.exp_month}/{method.card?.exp_year}
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodCard;