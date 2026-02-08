import { TaxRateEntry as TaxRateEntryType } from './types';

interface TaxRateEntryProps {
  rate: TaxRateEntryType;
  index: number;
  errors?: Partial<Record<keyof TaxRateEntryType, string>>;
  onChange: (index: number, field: keyof TaxRateEntryType, value: string) => void;
  onRemove: (index: number) => void;
}

export default function TaxRateEntry({ 
  rate, 
  index, 
  errors, 
  onChange, 
  onRemove 
}: TaxRateEntryProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tax Rate {index + 1}</p>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={rate.percentage}
            onChange={(e) => onChange(index, 'percentage', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
          />
          {errors?.percentage && (
            <p className="mt-1 text-xs text-red-500">{errors.percentage}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Country Code</label>
          <input
            type="text"
            value={rate.country}
            onChange={(e) => onChange(index, 'country', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            placeholder="US"
          />
          {errors?.country && (
            <p className="mt-1 text-xs text-red-500">{errors.country}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">State/Region</label>
          <input
            type="text"
            value={rate.state}
            onChange={(e) => onChange(index, 'state', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            placeholder="CA"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Description</label>
          <input
            type="text"
            value={rate.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            placeholder="California Sales Tax"
          />
          {errors?.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
