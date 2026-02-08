"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface RefundFormProps {
  readonly chargeId: string;
  readonly maxAmount: number;
}

const RefundForm = ({ chargeId, maxAmount }: RefundFormProps) => {
  const [amount, setAmount] = useState((maxAmount / 100).toFixed(2));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Call API to process refund
    console.log({ chargeId, amount: parseFloat(amount) * 100, reason });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold">Process Refund for {chargeId}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount to Refund</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={maxAmount / 100}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      {/* Add reason select dropdown */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Refunding...' : 'Submit Refund'}
      </Button>
    </form>
  );
};

export default RefundForm;