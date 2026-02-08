import { AccountRecord } from './types';

interface AccountSelectorProps {
  accounts: AccountRecord[];
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

export default function AccountSelector({ 
  accounts, 
  selectedAccountId, 
  setSelectedAccountId 
}: AccountSelectorProps) {
  if (accounts.length <= 1) return null;

  return (
    <div>
      <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Select Account
      </label>
      <select
        id="accountId"
        value={selectedAccountId ?? ""}
        onChange={(event) => setSelectedAccountId(Number(event.target.value))}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      >
        <option value="" disabled>Select an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.displayName || account.stripeAccountId || `Account ${account.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
