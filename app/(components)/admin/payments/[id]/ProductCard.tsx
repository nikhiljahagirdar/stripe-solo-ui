import Link from 'next/link';

interface ProductCardProps {
  readonly product: any; // Replace with StripeProduct type
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{product.description || 'No description available.'}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.active ? 'Active' : 'Inactive'}</span>
        <Link href={`/products/${product.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">View Details &rarr;</Link>
      </div>
    </div>
  );
};

export default ProductCard;