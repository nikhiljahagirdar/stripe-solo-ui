import axios from "axios";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface EnsureSetupOptions {
  token: string | null | undefined;
  pathname: string;
  router: AppRouterInstance;
  redirectPath?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const ensureStripeKeySetup = async ({
  token,
  pathname,
  router,
  redirectPath = "/admin/initsetup",
}: EnsureSetupOptions): Promise<void> => {
  if (!token) return;
  if (!pathname.startsWith("/admin")) return;
  if (pathname.startsWith(redirectPath)) return;

  try {
    const response = await axios.get(`${API_BASE_URL}/keys/has-keys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    const hasKeys = typeof data?.hasKeys === "boolean"
      ? data.hasKeys
      : Array.isArray(data)
        ? data.length > 0
        : Array.isArray(data?.data)
          ? data.data.length > 0
          : false;

    if (!hasKeys) {
      router.push(redirectPath);
    }
  } catch {
    // Fail open: avoid blocking the app if the check fails.
  }
};
