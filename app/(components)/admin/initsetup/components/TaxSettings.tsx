import { TaxFormState, TaxErrors, AccountRecord, TaxRateEntry as TaxRateEntryType } from './types';
import AccountSelector from './AccountSelector';
import AccountCard from './AccountCard';
import TaxRateEntry from './TaxRateEntry';

interface TaxSettingsProps {
  accounts: AccountRecord[];
  accountsLoading: boolean;
  accountsError: string | null;
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
  taxForm: TaxFormState;
  setTaxForm: (form: TaxFormState | ((prev: TaxFormState) => TaxFormState)) => void;
  taxErrors: TaxErrors;
}

export default function TaxSettings({
  accounts,
  accountsLoading,
  accountsError,
  selectedAccountId,
  setSelectedAccountId,
  taxForm,
  setTaxForm,
  taxErrors,
}: TaxSettingsProps) {
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const handleTaxRateChange = (index: number, field: keyof TaxRateEntryType, value: string) => {
    setTaxForm((prev) => ({
      ...prev,
      taxRates: prev.taxRates.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleRemoveTaxRate = (index: number) => {
    setTaxForm((prev) => ({
      ...prev,
      taxRates: prev.taxRates.filter((_, i) => i !== index),
    }));
  };

  const handleAddTaxRate = () => {
    setTaxForm((prev) => ({
      ...prev,
      taxRates: [
        ...prev.taxRates,
        { percentage: "", country: "", state: "", description: "" },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Configure Tax Settings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a Stripe account and configure how you collect taxes.
        </p>
      </div>

      {accountsLoading && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
          Loading accounts...
        </div>
      )}

      {accountsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
          {accountsError}
        </div>
      )}

      {!accountsLoading && accounts.length === 0 && !accountsError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300">
          No accounts found for this API key.
        </div>
      )}

      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />

      {selectedAccount && <AccountCard account={selectedAccount} />}

      {selectedAccountId && (
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={taxForm.taxEnabled}
              onChange={(event) => setTaxForm((prev) => ({ ...prev, taxEnabled: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Enable tax collection for this account
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={taxForm.automaticTax}
              disabled={!taxForm.taxEnabled}
              onChange={(event) => setTaxForm((prev) => ({ ...prev, automaticTax: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Use automatic tax calculation
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={taxForm.taxIdCollection}
              disabled={!taxForm.taxEnabled}
              onChange={(event) => setTaxForm((prev) => ({ ...prev, taxIdCollection: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Collect customer tax IDs
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tax behavior
            </label>
            <select
              value={taxForm.defaultTaxBehavior}
              onChange={(event) => setTaxForm((prev) => ({
                ...prev,
                defaultTaxBehavior: event.target.value as TaxFormState["defaultTaxBehavior"],
              }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
              <option value="unspecified">Unspecified</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tax Rates</h4>
              <button
                type="button"
                onClick={handleAddTaxRate}
                className="text-xs font-medium text-violet-600 hover:text-violet-700"
              >
                + Add Tax Rate
              </button>
            </div>

            {taxForm.taxRates.map((rate, index) => (
              <TaxRateEntry
                key={`tax-rate-${index}`}
                rate={rate}
                index={index}
                errors={taxErrors.entries?.[index]}
                onChange={handleTaxRateChange}
                onRemove={handleRemoveTaxRate}
              />
            ))}
            {taxErrors.taxRates && (
              <p className="text-xs text-red-500">{taxErrors.taxRates}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
