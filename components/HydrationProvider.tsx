"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Just mark as hydrated - Zustand will auto-hydrate with persist middleware
    setIsHydrated(true);
  }, []);

  // Show loading only on initial mount
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
