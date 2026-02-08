import { SyncStatus } from './types';

interface SyncOverlayProps {
  isOpen: boolean;
  status: SyncStatus;
  message: string;
  progress: number;
  onClose: () => void;
}

export default function SyncOverlay({ isOpen, status, message, progress, onClose }: SyncOverlayProps) {
  if (!isOpen) return null;

  const isSyncing = status === "syncing";
  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center border border-slate-200 dark:border-slate-700">
        {isSyncing && (
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        )}
        {isSuccess && (
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
            ✓
          </div>
        )}
        {isFailed && (
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
            ✕
          </div>
        )}
        <p className="text-sm text-slate-700 dark:text-slate-200">
          {message || "Please wait while we sync your stripe data"}
        </p>
        {progress > 0 && (
          <progress
            className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
            value={progress}
            max={100}
          />
        )}
        {!isSyncing && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
