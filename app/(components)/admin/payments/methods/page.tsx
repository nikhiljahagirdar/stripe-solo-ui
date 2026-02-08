"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { LoadingState } from '@/components';
import PaymentMethodCard from '../components/PaymentMethodCard';

export default function PaymentMethodsPage() {
  const token = useAuthStore((state) => state.token);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      if (!token) return;
      setLoading(true);
      // Note: API method not yet implemented
      // const data = await api.getPaymentMethods(token);
      // setMethods(data?.data || []);
      setMethods([]);
      setLoading(false);
    };
    fetchMethods();
  }, [token]);

  if (loading) return <LoadingState message="Loading payment methods..." />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <PaymentMethodCard key={method.id} method={method} />
        ))}
      </div>
      {methods.length === 0 && !loading && <p>No payment methods found.</p>}
    </div>
  );
}