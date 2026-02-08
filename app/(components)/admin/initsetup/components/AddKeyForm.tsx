import { IoInformationCircle, IoKey } from "react-icons/io5";
import { FormData, FormErrors } from './types';

interface AddKeyFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  touched: Record<keyof FormData, boolean>;
  setTouched: (touched: Record<keyof FormData, boolean>) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  isKeySubmitting: boolean;
  isSyncing: boolean;
  syncCompleted: boolean;
  handleAddKeyAndSync: () => void;
}

export default function AddKeyForm({
  formData,
  setFormData,
  errors,
  touched,
  setTouched,
  showApiKey,
  setShowApiKey,
  isKeySubmitting,
  isSyncing,
  syncCompleted,
  handleAddKeyAndSync,
}: AddKeyFormProps) {
  let syncButtonLabel = "Add Key";
  if (syncCompleted) {
    syncButtonLabel = "Key Added";
  } else if (isSyncing) {
    syncButtonLabel = "Syncing...";
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-2">How to get your Stripe API Key:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Log in to your <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Stripe Dashboard</a></li>
              <li>Navigate to <strong>Developers → API keys</strong></li>
              <li>Copy your <strong>Secret key</strong> (starts with <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">sk_live_</code> or <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">sk_test_</code>)</li>
              <li>Paste it below</li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          API Key Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={() => setTouched({ ...touched, name: true })}
          disabled={isKeySubmitting || isSyncing}
          className={`block w-full py-3 px-4 border rounded-lg shadow-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm
            dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400
            ${errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-600"}`}
          placeholder="e.g. Production Key"
        />
        {touched.name && errors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          A friendly name to identify this API key.
        </p>
      </div>

      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Stripe Secret Key <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoKey className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="apiKey"
            type={showApiKey ? "text" : "password"}
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            onBlur={() => setTouched({ ...touched, apiKey: true })}
            disabled={isKeySubmitting || isSyncing || syncCompleted}
            className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm
              dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400
              ${errors.apiKey ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-600"}`}
            placeholder="sk_live_..."
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            disabled={isKeySubmitting || isSyncing || syncCompleted}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {touched.apiKey && errors.apiKey && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.apiKey}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Your API key is stored securely. We never share it with third parties.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddKeyAndSync}
          disabled={isKeySubmitting || isSyncing || syncCompleted}
          className="px-6 py-2.5 rounded-lg bg-linear-to-r from-violet-600 to-purple-600 text-white font-medium 
            hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {syncButtonLabel}
        </button>
      </div>
    </div>
  );
}
