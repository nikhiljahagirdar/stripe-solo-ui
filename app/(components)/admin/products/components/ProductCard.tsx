import { AmountDisplay } from "@/components";
import { CubeIcon } from "@heroicons/react/24/outline";

interface ProductCardProps {
  readonly product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStatusColors = (active: boolean) => {
    return active 
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColors(product.prices?.active)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <CubeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{product.name || 'N/A'}</h3>
            <p className="text-xs text-gray-500 font-mono">
              {product.stripeProductId?.slice(-8) || 'N/A'}
            </p>
          </div>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          product.prices?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {product.prices?.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          {product.description || 'No description available'}
        </div>
        
        {product.prices ? (
          <div>
            <div className="text-lg font-semibold">
              <AmountDisplay amount={product.prices.unitAmount || 0} currency={product.prices.currency || 'usd'} />
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {product.prices.recurringInterval ? `per ${product.prices.recurringInterval}` : 'one-time'}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No pricing set</div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Created: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
}