// Shared types for init setup components

export interface FormData {
  name: string;
  apiKey: string;
}

export interface FormErrors {
  name?: string;
  apiKey?: string;
}

export type SyncStatus = "idle" | "syncing" | "success" | "failed";

export interface AccountRecord {
  id: number;
  stripeAccountId?: string;
  displayName?: string;
  email?: string;
  country?: string;
  defaultCurrency?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  type?: string;
}

export interface TaxRateEntry {
  percentage: string;
  country: string;
  state: string;
  description: string;
}

export interface TaxFormState {
  taxEnabled: boolean;
  automaticTax: boolean;
  taxIdCollection: boolean;
  defaultTaxBehavior: "exclusive" | "inclusive" | "unspecified";
  taxRates: TaxRateEntry[];
}

export interface TaxErrors {
  taxRates?: string;
  entries?: Array<Partial<Record<keyof TaxRateEntry, string>>>;
}

export interface UserSettingsState {
  emailNotifications: boolean;
  notificationFrequency: "realtime" | "daily" | "weekly";
  defaultDashboard: "overview" | "transactions" | "customers" | "analytics";
  currencyDisplay: string;
  primaryAccount: boolean;
  enableWebhooks: boolean;
}

export interface Step {
  id: number;
  label: string;
}
