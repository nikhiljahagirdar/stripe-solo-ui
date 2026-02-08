"use client";

import { ReactNode } from 'react';
import AuthGuard from './AuthGuard';

interface WithAuthProps {
  readonly children: ReactNode;
  readonly redirectTo?: string;
}

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo?: string
) {
  return function WithAuthComponent(props: P & WithAuthProps) {
    return (
      <AuthGuard redirectTo={redirectTo}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}
