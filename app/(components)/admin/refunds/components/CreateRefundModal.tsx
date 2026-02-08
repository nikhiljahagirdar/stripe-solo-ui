import { useState, useEffect } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { IoChevronDown } from "react-icons/io5";

interface CreateRefundModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRefundCreated: () => void;
  readonly token: string;
}

export default function CreateRefundModal({ isOpen, onClose, onRefundCreated, token }: CreateRefundModalProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    identifierType: 'charge',
    identifier: '',
    amount: '',
    reason: 'requested_by_customer',
    refund_application_fee: false,
    reverse_transfer: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token || !isOpen) return;
      try {
        const response = await fetch('http://localhost:3001/api/v1/accounts', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.data || [];
          setAccounts(items);
          if (items.length === 1) {
            setFormData((prev) => ({ ...prev, accountId: String(items[0]?.id ?? '') }));
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchAccounts();
  }, [token, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier) {
      setError(`${formData.identifierType === 'charge' ? 'Charge' : 'Payment Intent'} ID is required`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        accountId: formData.accountId,
        amount: formData.amount ? parseInt(formData.amount) : undefined,
        reason: formData.reason,
        refund_application_fee: formData.refund_application_fee,
        reverse_transfer: formData.reverse_transfer
      };

      if (formData.identifierType === 'charge') {
        payload.charge = formData.identifier;
      } else {
        payload.payment_intent = formData.identifier;
      }

      const response = await fetch('http://localhost:3001/api/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onRefundCreated();
        setFormData({
          accountId: '',
          identifierType: 'charge',
          identifier: '',
          amount: '',
          reason: 'requested_by_customer',
          refund_application_fee: false,
          reverse_transfer: false
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create refund');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Refund</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {accounts.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Account
              </label>
              <div className="relative">
                <select
                  value={formData.accountId}
                  onChange={(e) => handleInputChange('accountId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.businessProfileName || account.email || account.stripeAccountId}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="identifierType"
                  value="charge"
                  checked={formData.identifierType === 'charge'}
                  onChange={(e) => handleInputChange('identifierType', e.target.value)}
                  className="mr-2 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700">Charge ID</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="identifierType"
                  value="payment_intent"
                  checked={formData.identifierType === 'payment_intent'}
                  onChange={(e) => handleInputChange('identifierType', e.target.value)}
                  className="mr-2 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700">Payment Intent</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              placeholder={formData.identifierType === 'charge' ? "ch_..." : "pi_..."}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (cents)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Leave empty for full refund"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="mt-1 text-sm text-gray-500">Leave empty to refund the full amount</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <div className="relative">
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none bg-white"
              >
                <option value="requested_by_customer">Requested by Customer</option>
                <option value="duplicate">Duplicate</option>
                <option value="fraudulent">Fraudulent</option>
              </select>
              <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.refund_application_fee}
                onChange={(e) => handleInputChange('refund_application_fee', e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Refund Application Fee (Connect)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.reverse_transfer}
                onChange={(e) => handleInputChange('reverse_transfer', e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Reverse Transfer (Connect)</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}