"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PriceFormProps {
  readonly onSave: (price: any) => void;
  readonly loading: boolean;
}

const PriceForm = ({ onSave, loading }: PriceFormProps) => {
  const [unitAmount, setUnitAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState('month');
  const [intervalCount, setIntervalCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceData: any = {
      unit_amount: parseFloat(unitAmount) * 100,
      currency,
    };
    if (isRecurring) {
      priceData.recurring = { interval, interval_count: intervalCount };
    }
    onSave(priceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          value={unitAmount}
          onChange={(e) => setUnitAmount(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g., 29.99"
          step="0.01"
          required
        />
      </div>
      <div className="flex items-center">
        <input id="recurring" name="recurring" type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
        <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">This is a recurring price</label>
      </div>
      {isRecurring && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Interval</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Interval Count</label>
            <input
              type="number"
              value={intervalCount}
              onChange={(e) => setIntervalCount(parseInt(e.target.value, 10))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              required
            />
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Price'}</Button>
      </div>
    </form>
  );
};

export default PriceForm;