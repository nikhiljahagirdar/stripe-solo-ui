"use client";

import { ThemeProvider } from "@/lib/theme-provider";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { HydrationProvider } from "@/components/HydrationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <ThemeProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </ThemeProvider>
    </HydrationProvider>
  );
}
