"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ProductFormProps {
  readonly onSave: (product: any) => void;
  readonly productToEdit?: any | null;
  readonly loading: boolean;
}

const ProductForm = ({ onSave, productToEdit, loading }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setActive(productToEdit.active);
    }
  }, [productToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: productToEdit?.id, name, description, active });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., Premium Subscription"
          required
        />
      </div>
      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="A short description of the product."
        />
      </div>
      <div className="flex items-center">
        <input id="active" name="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active</label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
      </div>
    </form>
  );
};

export default ProductForm;