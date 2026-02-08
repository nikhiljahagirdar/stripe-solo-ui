"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface RoleFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (role: { id?: number; name: string }) => void;
  readonly roleToEdit: { id: number; name: string } | null;
  readonly loading: boolean;
}

const RoleForm = ({ isOpen, onClose, onSave, roleToEdit, loading }: RoleFormProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
    } else {
      setName('');
    }
  }, [roleToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: roleToEdit?.id, name });
  };

  return (
    <Modal id="role-form" show={isOpen} onClose={onClose} title={roleToEdit ? 'Edit Role' : 'Create New Role'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
            Role Name
          </label>
          <input
            id="role-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Administrator"
            required
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="neutral" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="success" disabled={loading}>{loading ? 'Saving...' : 'Save Role'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleForm;
