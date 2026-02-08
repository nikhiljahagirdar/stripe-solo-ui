"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { validateTokenAndRedirect, validateTokenDetailed, getAuthenticatedUser } from '@/utils/auth';
import { LoadingState } from '@/components';

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Check if user is authenticated and redirect accordingly
    if (token) {
      // User has token, validate it and redirect to dashboard
      const validation = validateTokenDetailed(token);
      console.log('HomePage - Token validation:', validation);
      
      if (validation.isValid) {
        const user = getAuthenticatedUser(token);
        console.log('HomePage - Authenticated user:', user);
        router.replace('/admin/dashboard');
      } else {
        console.log('HomePage - Token invalid, redirecting to login');
        validateTokenAndRedirect(token, router);
      }
    } else {
      // No token, redirect to login
      console.log('HomePage - No token found, redirecting to login');
      router.replace('/auth/login');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <LoadingState message="Checking authentication..." />
    </div>
  );
}