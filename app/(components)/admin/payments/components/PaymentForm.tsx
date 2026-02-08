"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const PaymentForm = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [customer, setCustomer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Call API to create payment intent
    console.log({ amount, currency, customer });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold">Create Payment Intent</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer ID</label>
        <input
          type="text"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="cus_..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (in cents)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      {/* Add other fields like currency, payment_method_types etc. */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Payment'}
      </Button>
    </form>
  );
};

export default PaymentForm;