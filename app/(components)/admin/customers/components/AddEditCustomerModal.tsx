"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import {Button }from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { IoChevronDown } from "react-icons/io5";

interface AddEditCustomerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (customer: any) => Promise<void>;
  readonly customer?: any;
}

export default function AddEditCustomerModal({ isOpen, onClose, onSave, customer }: AddEditCustomerModalProps) {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    stripeAccountId: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        stripeAccountId: customer.stripeAccountId || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        stripeAccountId: ""
      });
    }
  }, [customer, isOpen]);

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
          if (items.length === 1 && !customer) {
            setFormData((prev) => ({ ...prev, stripeAccountId: String(items[0]?.id ?? '') }));
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
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      id="add-edit-customer-modal"
      title={customer ? "Edit Customer" : "Add Customer"}
      show={isOpen}
      onClose={onClose}
      actions={
        <>
          <Button variant="neutral" style="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="success" style="solid" type="submit" loading={loading}>
            {customer ? "Update" : "Create"}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
        {accounts.length > 1 && (
          <div>
            <label className="text-sm font-medium text-gray-700">Stripe Account</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white appearance-none"
                value={formData.stripeAccountId}
                onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
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

        <Input
          label="Name"
          placeholder="Customer Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="customer@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </form>
    </Modal>
  );
}