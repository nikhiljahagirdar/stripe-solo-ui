"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import PlanSelector from './PlanSelector';

interface SubscriptionFormProps {
  readonly onSave: (subscription: any) => void;
  readonly subscriptionToEdit?: any | null;
  readonly loading: boolean;
}

const SubscriptionForm = ({ onSave, subscriptionToEdit, loading }: SubscriptionFormProps) => {
  const [customerId, setCustomerId] = useState(subscriptionToEdit?.customer || '');
  const [priceId, setPriceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !priceId) {
      alert('Please select a customer and a plan.');
      return;
    }
    onSave({ customer: customerId, items: [{ price: priceId }] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="customer-id" className="block text-sm font-medium text-gray-700">Customer ID</label>
        <input
          id="customer-id"
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="cus_..."
          required
          disabled={!!subscriptionToEdit} // Cannot change customer on existing subscription
        />
      </div>
      {!subscriptionToEdit && <PlanSelector onPlanSelect={setPriceId} />}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !priceId}>{loading ? 'Saving...' : 'Create Subscription'}</Button>
      </div>
    </form>
  );
};

export default SubscriptionForm;