import { UserSettingsState, AccountRecord, FormData } from './types';

interface UserSettingsProps {
  userSettings: UserSettingsState;
  setUserSettings: (settings: UserSettingsState | ((prev: UserSettingsState) => UserSettingsState)) => void;
  settingsLoading: boolean;
  selectedAccountId: number | null;
  accounts: AccountRecord[];
  formData: FormData;
  createdKeyId: number | null;
  taxSaved: boolean;
}

export default function UserSettings({
  userSettings,
  setUserSettings,
  settingsLoading,
  selectedAccountId,
  accounts,
  formData,
  createdKeyId,
  taxSaved,
}: UserSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">User Settings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure your preferences for notifications and dashboard defaults.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/40 space-y-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Setup Summary</p>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div>Key Name: {formData.name || "—"}</div>
          <div>Key ID: {createdKeyId ?? "—"}</div>
          <div>
            Account: {accounts.find((account) => account.id === selectedAccountId)?.displayName || "—"}
          </div>
          <div>Account ID: {selectedAccountId ?? "—"}</div>
          <div>Tax Settings: {taxSaved ? "Configured" : "Not configured"}</div>
        </div>
      </div>

      {settingsLoading && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
          Loading existing settings...
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</p>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={userSettings.emailNotifications}
              onChange={(event) => setUserSettings((prev) => ({ ...prev, emailNotifications: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Receive email notifications
          </label>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Notification frequency</label>
            <select
              value={userSettings.notificationFrequency}
              onChange={(event) =>
                setUserSettings((prev) => ({
                  ...prev,
                  notificationFrequency: event.target.value as UserSettingsState["notificationFrequency"],
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dashboard Preferences</p>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Default dashboard</label>
            <select
              value={userSettings.defaultDashboard}
              onChange={(event) =>
                setUserSettings((prev) => ({
                  ...prev,
                  defaultDashboard: event.target.value as UserSettingsState["defaultDashboard"],
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            >
              <option value="overview">Overview</option>
              <option value="transactions">Transactions</option>
              <option value="customers">Customers</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Preferred currency display</label>
            <select
              value={userSettings.currencyDisplay}
              onChange={(event) =>
                setUserSettings((prev) => ({ ...prev, currencyDisplay: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-600 dark:bg-slate-700"
            >
              <option value={userSettings.currencyDisplay}>{userSettings.currencyDisplay.toUpperCase()}</option>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Account Settings</p>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={userSettings.primaryAccount}
              onChange={(event) => setUserSettings((prev) => ({ ...prev, primaryAccount: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Set as primary account
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={userSettings.enableWebhooks}
              onChange={(event) => setUserSettings((prev) => ({ ...prev, enableWebhooks: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Enable webhook notifications for this account
          </label>
        </div>
      </div>
    </div>
  );
}
