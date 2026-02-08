"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface PriceFormProps {
  readonly onSave: (data: any) => void;
  readonly loading: boolean;
}

const PriceForm = ({ onSave, loading }: PriceFormProps) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceData = {
      amount: parseFloat(amount) * 100, // Convert to cents
      currency,
      interval,
    };
    
    await onSave(priceData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (USD)"
            type="number"
            step="0.01"
            placeholder="9.99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Billing Interval
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as 'month' | 'year')}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="success" 
            style="solid"
            loading={loading}
            disabled={loading || !amount}
            className="w-full"
          >
            Create Price
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceForm;
