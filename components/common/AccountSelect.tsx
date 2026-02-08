"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccountsStore } from '@/store/useAccountsStore';

export default function AccountSelect() {
  const token = useAuthStore((state) => state.token);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const setSelectedAccountId = useAccountsStore((state) => state.setSelectedAccountId);

  useEffect(() => {
    if (!token) return;
    if (accounts.length === 0) {
      fetchAccounts(token);
    }
  }, [token, accounts.length, fetchAccounts]);

  if (accounts.length <= 1) return null;

  return (
    <div className="flex items-center">
      <label htmlFor="accountSelect" className="sr-only">Select account</label>
      <select
        id="accountSelect"
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        value={selectedAccountId ?? ""}
        onChange={(event) => setSelectedAccountId(event.target.value)}
      >
        <option value="" disabled>Select account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.displayName ||
              account.businessProfileName ||
              account.business_profile?.name ||
              account.email ||
              account.stripeAccountId ||
              `Account ${account.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
