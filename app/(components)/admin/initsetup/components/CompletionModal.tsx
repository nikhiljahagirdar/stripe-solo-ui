import { useRouter } from "next/navigation";

interface CompletionModalProps {
  isOpen: boolean;
  countdown: number;
  savedSettingIds: number[];
}

export default function CompletionModal({ 
  isOpen, 
  countdown, 
  savedSettingIds 
}: CompletionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center border border-slate-200 dark:border-slate-700">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Setup Complete!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
          Redirecting in {countdown} seconds...
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Saved {savedSettingIds.length || 0} settings
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/accounts")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            View Account Details
          </button>
        </div>
      </div>
    </div>
  );
}
