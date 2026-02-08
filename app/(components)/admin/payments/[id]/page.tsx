"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import PriceForm from './PriceForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CreatePricePage({ params }: { params: { id: string } }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (priceData: any) => {
    if (!token) return;
    setLoading(true);
    try {
      // Note: API method not yet implemented
      // await api.createPriceForProduct(token, params.id, priceData);
      toast.success("Price created successfully!");
      router.push(`/products/${params.id}`);
    } catch (error) {
      console.error("Failed to create price:", error);
      toast.error("Failed to create price.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Link href={`/products/${params.id}`} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"><ArrowLeftIcon className="h-5 w-5" /> Back to Product</Link>
      <h1 className="text-2xl font-bold mb-4">Add New Price</h1>
      <PriceForm onSave={handleSave} loading={loading} />
    </div>
  );
}