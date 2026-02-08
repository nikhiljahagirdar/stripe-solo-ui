'use client';

import { useEffect, useRef, useState, FormEvent, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import { IoKey, IoArrowBack, IoArrowForward, IoCheckmark } from "react-icons/io5";
import { io, Socket } from "socket.io-client";
import type {
  FormData,
  FormErrors,
  SyncStatus,
  AccountRecord,
  TaxFormState,
  TaxErrors,
  TaxRateEntry,
  UserSettingsState,
  Step,
} from "./components/types";
import * as encryption from "@/utils/encryption";

// Lazy load all components
const StepIndicator = lazy(() => import("./components/StepIndicator"));
const AddKeyForm = lazy(() => import("./components/AddKeyForm"));
const TaxSettings = lazy(() => import("./components/TaxSettings"));
const UserSettings = lazy(() => import("./components/UserSettings"));
const CompletionModal = lazy(() => import("./components/CompletionModal"));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const InitSetup = () => {
  // Get the authentication token from the Zustand store
  const authToken = useAuthStore((state) => state.token);

  // State for form inputs
  const [formData, setFormData] = useState<FormData>({
    name: "",
    apiKey: "",
  });

  // State to manage the current step
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // State for validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    apiKey: false,
  });

  // State to handle loading during API call
  const [isLoading, setIsLoading] = useState(false);
  const [isKeySubmitting, setIsKeySubmitting] = useState(false);

  // State to show/hide API key
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [createdKeyId, setCreatedKeyId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [taxForm, setTaxForm] = useState<TaxFormState>({
    taxEnabled: false,
    automaticTax: false,
    taxIdCollection: false,
    defaultTaxBehavior: "exclusive",
    taxRates: [],
  });
  const [taxErrors, setTaxErrors] = useState<TaxErrors>({});
  const [taxSaved, setTaxSaved] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettingsState>({
    emailNotifications: true,
    notificationFrequency: "realtime",
    defaultDashboard: "overview",
    currencyDisplay: "usd",
    primaryAccount: false,
    enableWebhooks: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionCountdown, setCompletionCountdown] = useState(2);
  const [savedSettingIds, setSavedSettingIds] = useState<number[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const syncToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authToken) return;

    const socket = io("ws://localhost:3001", {
      auth: { token: authToken },
      path: "/socket.io/",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Connection established; keep UI focused on sync status.
    });

    socket.on("disconnect", () => {
      if (syncStatus === "syncing") {
        toast.error("Connection lost. Reconnecting...");
      }
    });

    socket.on("notification", (data: { type: string; message?: string }) => {
      if (data.type === "sync_success") {
        console.log("✅ Accounts synced:", data.message);
        setIsSyncing(false);
        setSyncCompleted(true);
        setSyncStatus("success");
        setSyncProgress(100);
        setSyncMessage(data.message || "Account synced successfully");
        if (syncToastIdRef.current) {
          toast.success(data.message || "Account synced successfully", { id: syncToastIdRef.current });
          syncToastIdRef.current = null;
        } else {
          toast.success(data.message || "Account synced successfully");
        }
      } else if (data.type === "sync_failure") {
        setIsSyncing(false);
        setSyncCompleted(false);
        setSyncStatus("failed");
        setSyncMessage(data.message || "Sync failed");
        if (syncToastIdRef.current) {
          toast.error(data.message || "Sync failed", { id: syncToastIdRef.current });
          syncToastIdRef.current = null;
        } else {
          toast.error(data.message || "Sync failed");
        }
      }
    });

    socket.on("sync_status", (status: {
      event: "sync_started" | "sync_completed" | "sync_failed";
      keyName?: string;
      message?: string;
      progress?: number;
    }) => {
      if (status.event === "sync_started") {
        setIsSyncing(true);
        setSyncStatus("syncing");
        setSyncProgress(0);
        console.log("🔄 Sync started for:", status.keyName);
        setSyncMessage(status.message || "Starting account sync...");
        if (!syncToastIdRef.current) {
          syncToastIdRef.current = toast.loading(status.message || "Starting account sync...");
        } else {
          toast.loading(status.message || "Starting account sync...", { id: syncToastIdRef.current });
        }
        if (typeof status.progress === "number") {
          setSyncProgress(status.progress);
        }
      } else if (status.event === "sync_completed") {
        setIsSyncing(false);
        setSyncCompleted(true);
        setSyncStatus("success");
        setSyncProgress(100);
        console.log("✅ Sync completed:", status.keyName);
        setSyncMessage(status.message || "Account synced successfully");
        if (syncToastIdRef.current) {
          toast.success(status.message || "Account synced successfully", { id: syncToastIdRef.current });
          syncToastIdRef.current = null;
        } else {
          toast.success(status.message || "Account synced successfully");
        }
      } else if (status.event === "sync_failed") {
        setIsSyncing(false);
        setSyncCompleted(false);
        setSyncStatus("failed");
        console.log("❌ Sync failed:", status.keyName);
        setSyncMessage(status.message || "Sync failed");
        if (syncToastIdRef.current) {
          toast.error(status.message || "Sync failed", { id: syncToastIdRef.current });
          syncToastIdRef.current = null;
        } else {
          toast.error(status.message || "Sync failed");
        }
      }
    });

    socket.on("connect_error", (error: { message: string }) => {
      setSyncMessage(error.message || "Socket connection error");
      toast.error(error.message || "Socket connection error");
      setSyncStatus("failed");
      setIsSyncing(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authToken, currentStep, syncStatus]);

  useEffect(() => {
    if (currentStep !== 2 || !createdKeyId || !authToken) return;

    const loadAccounts = async () => {
      setAccountsLoading(true);
      setAccountsError(null);
      try {
        const response = await api.getAccountsByKey(authToken, createdKeyId);
        const items = getAccountsFromResponse(response) as AccountRecord[];
        setAccounts(items);
        if (items.length === 1) {
          setSelectedAccountId(items[0]?.id ?? null);
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
        setAccountsError("Unable to load accounts. Please go back and verify your API key.");
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, [currentStep, createdKeyId, authToken]);

  useEffect(() => {
    if (!selectedAccountId || !authToken || currentStep !== 2) return;

    const loadTaxSettings = async () => {
      try {
        const existing = await api.getTaxSettings(authToken, selectedAccountId);
        if (existing && typeof existing === "object") {
          setTaxForm((prev) => ({
            ...prev,
            taxEnabled: Boolean((existing as any).taxEnabled ?? prev.taxEnabled),
            automaticTax: Boolean((existing as any).automaticTax ?? prev.automaticTax),
            taxIdCollection: Boolean((existing as any).taxIdCollection ?? prev.taxIdCollection),
            defaultTaxBehavior: (existing as any).defaultTaxBehavior || prev.defaultTaxBehavior,
            taxRates: Array.isArray((existing as any).taxRates)
              ? (existing as any).taxRates.map((rate: any) => ({
                  percentage: String(rate.percentage ?? ""),
                  country: String(rate.country ?? ""),
                  state: String(rate.state ?? ""),
                  description: String(rate.description ?? ""),
                }))
              : prev.taxRates,
          }));
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
        console.error("Failed to load tax settings:", error);
      }
    };

    loadTaxSettings();
  }, [selectedAccountId, authToken, currentStep]);

  useEffect(() => {
    setTaxSaved(false);
  }, [taxForm, selectedAccountId]);

  useEffect(() => {
    if (!selectedAccountId) return;
    const selected = accounts.find((account) => account.id === selectedAccountId);
    if (selected?.defaultCurrency) {
      setUserSettings((prev) => ({
        ...prev,
        currencyDisplay: selected.defaultCurrency || prev.currencyDisplay,
      }));
    }
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    if (currentStep !== 3 || !authToken) return;

    const loadSettings = async () => {
      setSettingsLoading(true);
      try {
        let response: any = null;
        try {
          response = await api.getUserSettingsDetailed(authToken);
        } catch (error) {
          response = await api.getUserSettings(authToken);
        }

        const settingsArray = Array.isArray(response) ? response : response?.data || [];
        if (!Array.isArray(settingsArray)) return;

        const getSettingValue = (settingId: number) =>
          settingsArray.find((item: any) => item.settingId === settingId)?.value;

        const parseBool = (value: unknown) =>
          value === true || value === "true" || value === "1" || value === 1;

        setUserSettings((prev) => ({
          ...prev,
          emailNotifications: parseBool(getSettingValue(1)) ?? prev.emailNotifications,
          notificationFrequency: (getSettingValue(2) as UserSettingsState["notificationFrequency"]) || prev.notificationFrequency,
          defaultDashboard: (getSettingValue(3) as UserSettingsState["defaultDashboard"]) || prev.defaultDashboard,
          currencyDisplay: (getSettingValue(4) as string) || prev.currencyDisplay,
          primaryAccount: parseBool(getSettingValue(5)) ?? prev.primaryAccount,
          enableWebhooks: parseBool(getSettingValue(6)) ?? prev.enableWebhooks,
        }));
      } catch (error) {
        console.error("Failed to load user settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [currentStep, authToken]);

  useEffect(() => {
    if (!completionOpen) return;

    setCompletionCountdown(2);
    const interval = window.setInterval(() => {
      setCompletionCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    const timeout = window.setTimeout(() => {
      router.push("/admin/dashboard");
    }, 2000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [completionOpen, router]);

  useEffect(() => {
    setSettingsSaved(false);
  }, [userSettings]);

  useEffect(() => {
    if (currentStep !== 3) {
      setCompletionOpen(false);
      setSettingsSaved(false);
    }
  }, [currentStep]);

  const namePattern = /^[a-zA-Z0-9 _-]+$/;
  const apiKeyPattern = /^sk_(test|live)_[a-zA-Z0-9]+$/;

  const validateStepOne = (): FormErrors => {
    const newErrors: FormErrors = {};
    const nameValue = formData.name.trim();
    if (!nameValue) {
      newErrors.name = "API key name is required.";
    } else if (nameValue.length < 3 || nameValue.length > 100) {
      newErrors.name = "Name must be between 3 and 100 characters.";
    } else if (!namePattern.test(nameValue)) {
      newErrors.name = "Use only letters, numbers, spaces, hyphens, and underscores.";
    }

    const apiKeyValue = formData.apiKey.trim();
    if (!apiKeyValue) {
      newErrors.apiKey = "Stripe API Key is required.";
    } else if (!apiKeyPattern.test(apiKeyValue)) {
      newErrors.apiKey = "Please enter a valid Stripe secret key starting with sk_test_ or sk_live_.";
    }
    return newErrors;
  };

  const validateForm = (): FormErrors => {
    if (currentStep === 1) return validateStepOne();
    return {};
  };

  const getAccountsFromResponse = (accountsResponse: { data?: { data?: unknown } } | unknown) => {
    if (Array.isArray((accountsResponse as { data?: { data?: unknown } })?.data?.data)) {
      return (accountsResponse as { data?: { data?: unknown } }).data?.data as unknown[];
    }
    if (Array.isArray((accountsResponse as { data?: unknown })?.data)) {
      return (accountsResponse as { data?: unknown }).data as unknown[];
    }
    if (Array.isArray(accountsResponse)) {
      return accountsResponse;
    }
    return [];
  };

  const validateTaxSettings = (): TaxErrors => {
    const errors: TaxErrors = {};
    const entryErrors: Array<Partial<Record<keyof TaxRateEntry, string>>> = [];

    if (!taxForm.taxEnabled && taxForm.taxRates.length === 0) {
      errors.taxRates = "Configure at least one tax setting before saving.";
    }

    if (taxForm.taxRates.length > 0) {
      taxForm.taxRates.forEach((rate, index) => {
        const rateErrors: Partial<Record<keyof TaxRateEntry, string>> = {};
        const percentage = Number(rate.percentage);
        if (rate.percentage === "") {
          rateErrors.percentage = "Tax rate is required.";
        } else if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
          rateErrors.percentage = "Tax percentage must be between 0 and 100.";
        }
        if (!rate.country.trim()) {
          rateErrors.country = "Country code is required.";
        } else if (rate.country.trim().length !== 2) {
          rateErrors.country = "Use a 2-letter country code.";
        }
        if (!rate.description.trim()) {
          rateErrors.description = "Description is required.";
        }
        entryErrors[index] = rateErrors;
      });
    }

    if (entryErrors.some((entry) => Object.keys(entry).length > 0)) {
      errors.entries = entryErrors;
    }

    return errors;
  };

  const saveTaxSettings = async (): Promise<boolean> => {
    if (!authToken || !selectedAccountId) return false;
    setIsLoading(true);
    setTaxErrors({});

    const validation = validateTaxSettings();
    if (
      validation.taxRates ||
      (validation.entries && validation.entries.some((entry) => Object.keys(entry).length > 0))
    ) {
      setTaxErrors(validation);
      setIsLoading(false);
      return false;
    }

    const payload = {
      taxEnabled: taxForm.taxEnabled,
      automaticTax: taxForm.taxEnabled ? taxForm.automaticTax : false,
      taxIdCollection: taxForm.taxEnabled ? taxForm.taxIdCollection : false,
      defaultTaxBehavior: taxForm.defaultTaxBehavior,
      taxRates: taxForm.taxRates
        .filter((rate) => rate.country.trim() || rate.percentage.trim() || rate.description.trim())
        .map((rate) => ({
          percentage: Number(rate.percentage),
          country: rate.country.trim().toUpperCase(),
          state: rate.state.trim() || undefined,
          description: rate.description.trim(),
        })),
    };

    const toastId = toast.loading("Saving tax settings...");
    try {
      await api.upsertTaxSettings(authToken, selectedAccountId, payload as any);
      setTaxSaved(true);
      toast.success("Tax settings saved successfully!", { id: toastId });
      return true;
    } catch (error) {
      let errorMessage = "Failed to save tax settings.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserSettings = async (): Promise<boolean> => {
    if (!authToken) return false;

    setIsLoading(true);
    const toastId = toast.loading("Saving user settings...");
    try {
      const metadata = {
        accountId: selectedAccountId ?? undefined,
        relatedKeyId: createdKeyId ?? undefined,
        source: "setup-wizard",
      };

      const payloads = [
        { settingId: 1, value: String(userSettings.emailNotifications), metadata },
        { settingId: 2, value: userSettings.notificationFrequency, metadata },
        { settingId: 3, value: userSettings.defaultDashboard, metadata },
        { settingId: 4, value: userSettings.currencyDisplay, metadata },
        { settingId: 5, value: String(userSettings.primaryAccount), metadata: { ...metadata, accountId: selectedAccountId } },
        { settingId: 6, value: String(userSettings.enableWebhooks), metadata },
      ];

      const responses = await Promise.all(payloads.map((payload) => api.upsertUserSetting(authToken, payload)));
      const ids = responses
        .map((item: any) => item?.id)
        .filter((id) => typeof id === "number") as number[];
      setSavedSettingIds(ids);
      setSettingsSaved(true);
      setCompletionOpen(true);
      toast.success("User settings saved successfully!", { id: toastId });
      return true;
    } catch (error) {
      let errorMessage = "Failed to save user settings.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (currentStep === 1) {
      setTouched({ name: true, apiKey: true });
    }

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const saved = await saveTaxSettings();
      if (saved) {
        setCurrentStep(3);
      }
      return;
    }

    if (currentStep === 3) {
      await saveUserSettings();
    }
  };

  const handleAddKeyAndSync = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    setTouched({ name: true, apiKey: true });
    if (Object.keys(validationErrors).length > 0) return;

    if (!authToken) {
      toast.error("Authentication error: You are not logged in.");
      return;
    }

    setIsKeySubmitting(true);
    setSyncCompleted(false);
    setSyncStatus("idle");
    setSyncProgress(0);
    setSyncMessage("");

    const toastId = toast.loading("Adding key and syncing accounts...");
    try {
      let encryptedKey: string;
      try {
        encryptedKey = await encryption.encrypt(formData.apiKey.trim());
      } catch (error) {
        throw new Error(
          "Encryption is not configured. Set NEXT_PUBLIC_ENCRYPTION_KEY and NEXT_PUBLIC_ENCRYPTION_IV."
        );
      }
      const keyResponse = await api.createKey(authToken, {
        name: formData.name,
        apiKey: encryptedKey,
      });

      const stripeKeyId = keyResponse?.key?.id;
      const accountId = keyResponse?.accountId;

      if (typeof stripeKeyId !== "number") {
        throw new Error("Key created but no stripeKeyId returned.");
      }

      setCreatedKeyId(stripeKeyId);
      if (typeof accountId === "number") {
        setSelectedAccountId(accountId);
      }

      setIsSyncing(true);
      setSyncStatus("syncing");
      setSyncMessage("Starting account sync...");
      if (!syncToastIdRef.current) {
        syncToastIdRef.current = toast.loading("Starting account sync...");
      }
     
      if (!socketRef.current) {
        toast("Sync started. Live status updates are unavailable.");
      }

      const successMessage =
        typeof keyResponse?.message === "string"
          ? keyResponse.message
          : "Key added. Syncing account...";
      toast.success(successMessage, { id: toastId });
      setFormData((prev) => ({ ...prev, apiKey: "" }));
    } catch (error) {
      let errorMessage = "Failed to add key.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage, { id: toastId });
      setIsSyncing(false);
      setSyncStatus("failed");
      if (syncToastIdRef.current) {
        toast.error(errorMessage, { id: syncToastIdRef.current });
        syncToastIdRef.current = null;
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsKeySubmitting(false);
    }
  };

  let syncButtonLabel = "Add Key";
  if (syncCompleted) {
    syncButtonLabel = "Key Added";
  } else if (isSyncing) {
    syncButtonLabel = "Syncing...";
  }

  const renderActionContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <>
          Next <IoArrowForward className="w-4 h-4" />
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          Save & Next <IoArrowForward className="w-4 h-4" />
        </>
      );
    }

    return (
      <>
        {settingsSaved ? "Saved" : "Finish Setup"} <IoCheckmark className="w-4 h-4" />
      </>
    );
  };

  const steps: Step[] = [
    { id: 1, label: "Add Stripe Key" },
    { id: 2, label: "Configure Tax" },
    { id: 3, label: "User Settings" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-2xl shadow-2xl dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
        {/* Stepper Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-linear-to-br from-violet-500 to-purple-600 rounded-full">
            <IoKey className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Initial Setup
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Step {currentStep} of 3
          </p>
          
          {/* Progress Bar */}
          <progress
            className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
            value={(currentStep / 3) * 100}
            max={100}
          />
          <Suspense fallback={<LoadingFallback />}>
            <StepIndicator steps={steps} currentStep={currentStep} />
          </Suspense>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Add Stripe API Key */}
          {currentStep === 1 && (
            <Suspense fallback={<LoadingFallback />}>
              <AddKeyForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                touched={touched}
                setTouched={setTouched}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
                isKeySubmitting={isKeySubmitting}
                isSyncing={isSyncing}
                syncCompleted={syncCompleted}
                handleAddKeyAndSync={handleAddKeyAndSync}
              />
            </Suspense>
          )}

          {/* Step 2: Configure Tax Settings */}
          {currentStep === 2 && (
            <Suspense fallback={<LoadingFallback />}>
              <TaxSettings
                accounts={accounts}
                accountsLoading={accountsLoading}
                accountsError={accountsError}
                selectedAccountId={selectedAccountId}
                setSelectedAccountId={setSelectedAccountId}
                taxForm={taxForm}
                setTaxForm={setTaxForm}
                taxErrors={taxErrors}
              />
            </Suspense>
          )}
          {/* Step 3: User Settings */}
          {currentStep === 3 && (
            <Suspense fallback={<LoadingFallback />}>
              <UserSettings
                userSettings={userSettings}
                setUserSettings={setUserSettings}
                settingsLoading={settingsLoading}
                selectedAccountId={selectedAccountId}
                accounts={accounts}
                formData={formData}
                createdKeyId={createdKeyId}
                taxSaved={taxSaved}
              />
            </Suspense>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                  hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
              >
                <IoArrowBack className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={
                isLoading ||
                isSyncing ||
                (currentStep === 1 && (isSyncing || !createdKeyId)) ||
                (currentStep === 2 && !selectedAccountId) ||
                (currentStep === 3 && (completionOpen || settingsLoading))
              }
              className="flex-1 px-6 py-2.5 rounded-lg bg-linear-to-r from-violet-600 to-purple-600 text-white font-medium 
                hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {renderActionContent()}
            </button>
          </div>
        </form>
        
        <Suspense fallback={null}>
          <CompletionModal
            isOpen={completionOpen}
            countdown={completionCountdown}
            savedSettingIds={savedSettingIds}
          />
        </Suspense>
      </div>
    </main>
  );
};

export default InitSetup;