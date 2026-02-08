"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { validateTokenDetailed, setupAutoLogout } from '@/utils/auth';
import { ensureStripeKeySetup } from '@/utils/setup';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  readonly children: React.ReactNode;
  readonly redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const autoLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const validateAuth = async () => {
      console.log('AuthGuard: Validating token:', token);
      setIsValidating(true);
      
      // Check if token exists and is valid
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push(redirectTo);
        return;
      }

      const validation = validateTokenDetailed(token);
      console.log('Token validation:', validation);

      if (!validation.isValid) {
        console.log('Token validation failed:', validation.error);
        // Clear any stored auth data
        if (typeof globalThis.localStorage !== 'undefined') {
          globalThis.localStorage.removeItem('token');
          globalThis.localStorage.removeItem('user');
          globalThis.sessionStorage.removeItem('token');
          globalThis.sessionStorage.removeItem('user');
        }
        
        // Show notification if available
        if ((globalThis as any).toast) {
          if (validation.isExpired) {
            (globalThis as any).toast.error('Your session has expired. Please log in again.');
          } else {
            (globalThis as any).toast.error('Authentication failed. Please log in again.');
          }
        }
        
        router.push(redirectTo);
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Token is valid
      setIsAuthenticated(true);
      setIsValidating(false);

      // Ensure initial setup is completed
      void ensureStripeKeySetup({ token, pathname, router });

      // Set up auto-logout
      if (validation.willExpireSoon && validation.expiresInSeconds > 0) {
        console.log(`Token will expire in ${validation.expiresInSeconds} seconds`);
        
        // Show warning if token expires soon
        if ((globalThis as any).toast && validation.expiresInSeconds <= 300) {
          (globalThis as any).toast.warning('Your session will expire soon. Please save your work.', {
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
    };

    validateAuth();
  }, [token, router, redirectTo, pathname]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
      }
    };
  }, []);

  // Show loading spinner while validating
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
        <div className="ml-4 text-gray-600 dark:text-gray-300">
          Validating session...
        </div>
      </div>
    );
  }

  // If not authenticated, the redirect will happen in the useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {token ? 'Session expired' : 'Authentication required'}
          </p>
        </motion.div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
