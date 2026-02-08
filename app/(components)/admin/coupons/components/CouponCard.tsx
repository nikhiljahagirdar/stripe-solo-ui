import { TicketIcon, CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import { AmountDisplay } from "@/components";

interface CouponCardProps {
  readonly coupon: any;
  readonly className?: string;
}

export default function CouponCard({ coupon, className = "" }: CouponCardProps) {
  const isExpired = coupon.redeemBy && new Date(coupon.redeemBy) < new Date();
  const isValid = coupon.valid && !isExpired;

  return (
    <div className={`p-6 rounded-lg border-2 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <TicketIcon className="h-5 w-5 mr-2 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {coupon.name || 'Unnamed Coupon'}
            </h3>
            <p className="text-sm font-mono text-gray-500">{coupon.stripeCouponId}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isValid ? 'Valid' : 'Invalid'}
        </div>
      </div>

      <div className="space-y-3">
        {/* Discount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Discount:</span>
          <div className="font-medium">
            {coupon.amountOff ? (
              <AmountDisplay amount={coupon.amountOff} currency={coupon.currency || 'usd'} />
            ) : coupon.percentOff ? (
              <span>{coupon.percentOff}% off</span>
            ) : (
              <span className="text-gray-500">No discount</span>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration:</span>
          <div className="text-sm">
            <span className="capitalize">{coupon.duration}</span>
            {coupon.duration === 'repeating' && coupon.durationInMonths && (
              <span className="text-gray-500 ml-1">({coupon.durationInMonths}m)</span>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            Usage:
          </span>
          <div className="text-sm">
            <span className="font-medium">{coupon.timesRedeemed || 0}</span>
            {coupon.maxRedemptions && (
              <span className="text-gray-500"> / {coupon.maxRedemptions}</span>
            )}
          </div>
        </div>

        {/* Expiry */}
        {coupon.redeemBy && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Expires:
            </span>
            <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
              {new Date(coupon.redeemBy).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">Created:</span>
          <span className="text-xs text-gray-500">
            {new Date(coupon.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}