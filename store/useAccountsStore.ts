"use client";

import { create } from 'zustand';
import { api } from '@/services/api';

export interface AccountRecord {
  id: number;
  displayName?: string;
  businessProfileName?: string;
  business_profile?: {
    name?: string;
  };
  email?: string;
  stripeAccountId?: string;
}

interface AccountsState {
  accounts: AccountRecord[];
  selectedAccountId: string | null;
  loading: boolean;
  error: string | null;
  fetchAccounts: (token: string) => Promise<void>;
  setSelectedAccountId: (id: string | null) => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: [],
  selectedAccountId: null,
  loading: false,
  error: null,
  fetchAccounts: async (token: string) => {
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const response = await api.getAccounts(token);
      const items = Array.isArray(response) ? response : response?.data || [];
      const accounts = Array.isArray(items) ? items : [];
      set({ accounts });
      if (accounts.length === 1) {
        set({ selectedAccountId: String(accounts[0]?.id ?? '') });
      }
    } catch (error) {
      set({ error: 'Unable to load accounts.' });
    } finally {
      set({ loading: false });
    }
  },
  setSelectedAccountId: (id: string | null) => set({ selectedAccountId: id }),
}));
