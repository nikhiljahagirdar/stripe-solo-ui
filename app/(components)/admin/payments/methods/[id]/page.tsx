"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { LoadingState } from '@/components';
import PaymentMethodCard from '../../components/PaymentMethodCard';

export default function PaymentMethodDetailsPage({ params }: { params: { id: string } }) {
  const token = useAuthStore((state) => state.token);
  const [method, setMethod] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethod = async () => {
      if (!token) return;
      setLoading(true);
      // TODO: Use correct API endpoint for a single payment method
      // const data = await api.getPaymentMethodById(token, params.id);
      // setMethod(data);
      setLoading(false);
    };
    fetchMethod();
  }, [token, params.id]);

  if (loading) return <LoadingState message="Loading payment method..." />;

  return <div className="p-6">{method ? <PaymentMethodCard method={method} /> : <p>Payment method not found.</p>}</div>;
}