"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';

interface PlanSelectorProps {
  readonly onPlanSelect: (priceId: string) => void;
}

const PlanSelector = ({ onPlanSelect }: PlanSelectorProps) => {
  const token = useAuthStore((state) => state.token);
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    // TODO: Fetch products with recurring prices
    const fetchProducts = async () => {
      // const data = await api.getProducts(token, { type: 'service' });
      // setProducts(data?.data || []);
    };
    fetchProducts();
  }, [token]);

  useEffect(() => {
    if (!selectedProduct) return;
    // TODO: Fetch prices for the selected product
    const fetchPrices = async () => {
      // const data = await api.getPricesForProduct(token, selectedProduct);
      // setPrices(data?.data.filter(p => p.recurring) || []);
    };
    fetchPrices();
  }, [selectedProduct, token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Product</label>
        <select onChange={(e) => setSelectedProduct(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Select a product</option>
          {/* {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} */}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Plan (Price)</label>
        <select onChange={(e) => onPlanSelect(e.target.value)} disabled={!selectedProduct || prices.length === 0} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Select a plan</option>
          {/* {prices.map(p => <option key={p.id} value={p.id}>{p.nickname || p.id} - ${(p.unit_amount / 100).toFixed(2)}/{p.recurring.interval}</option>)} */}
        </select>
      </div>
    </div>
  );
};

export default PlanSelector;