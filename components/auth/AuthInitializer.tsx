"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { validateTokenDetailed, setupAutoLogout } from '@/utils/auth';

interface AuthInitializerProps {
  readonly children: React.ReactNode;
  readonly skipAuth?: boolean;
}

export default function AuthInitializer({ children, skipAuth = false }: AuthInitializerProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const autoLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip all auth logic if skipAuth is true (for auth pages)
    if (skipAuth) return;

    // Only set up auto-logout timer if we have a valid token
    // Don't redirect here - let AuthGuard handle redirects
    if (token && typeof globalThis.location !== 'undefined') {
      const currentPath = globalThis.location.pathname;
      
      // Skip auth pages
      if (currentPath.startsWith('/auth/')) {
        return;
      }

      const validation = validateTokenDetailed(token);
      
      if (validation.isValid) {
        // Set up auto-logout timer
        if (validation.willExpireSoon && validation.expiresInSeconds > 0) {
          console.log(`Token will expire in ${validation.expiresInSeconds} seconds`);
          
          // Show warning if token expires soon
          if ((globalThis as any).toast && validation.expiresInSeconds <= 300) {
            (globalThis as any).toast.warning('Your session will expire soon.', {
              duration: 5000,
            });
          }
        }

        // Clear existing timer and set up new one
        if (autoLogoutTimerRef.current) {
          clearTimeout(autoLogoutTimerRef.current);
        }
        
        const timer = setupAutoLogout(router, token);
        autoLogoutTimerRef.current = timer;
      }
    }
  }, [token, router, skipAuth]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
