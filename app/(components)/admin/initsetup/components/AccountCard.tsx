import { AccountRecord } from './types';

interface AccountCardProps {
  account: AccountRecord;
}

export default function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/40 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {account.displayName || "Stripe Account"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{account.email || "No email"}</p>
        </div>
        {account.type && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
            {account.type}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-300">
        Stripe ID: {account.stripeAccountId || "—"}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div>Country: {(account.country || "—").toUpperCase()}</div>
        <div>Currency: {(account.defaultCurrency || "—").toUpperCase()}</div>
        <div className="flex items-center gap-2">
          Charges: {account.chargesEnabled ? "✅" : "❌"}
        </div>
        <div className="flex items-center gap-2">
          Payouts: {account.payoutsEnabled ? "✅" : "❌"}
        </div>
      </div>
    </div>
  );
}
