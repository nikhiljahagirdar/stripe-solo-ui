"use client";

import React from 'react';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly showThemeSelector?: boolean;
  readonly themeSelectorVariant?: 'dropdown' | 'toggle' | 'pills';
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  className,
  showThemeSelector = true,
  themeSelectorVariant = 'toggle'
}) => {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800", className)}>
      {showThemeSelector && (
        <ThemeSelector variant={themeSelectorVariant} />
      )}
      
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary-200 to-accent-200 opacity-20 blur-3xl dark:from-primary-800 dark:to-accent-800" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-accent-200 to-primary-200 opacity-20 blur-3xl dark:from-accent-800 dark:to-primary-800" />
      </div>
    </div>
  );
};
