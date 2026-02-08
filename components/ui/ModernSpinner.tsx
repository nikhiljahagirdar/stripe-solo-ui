"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ModernSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly variant?: 'default' | 'dots' | 'pulse' | 'bars';
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = 'md',
  className,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary-500 animate-bounce",
              sizeClasses[size],
              i === 0 && "animation-delay-0",
              i === 1 && "animation-delay-150",
              i === 2 && "animation-delay-300"
            )}
            style={{
              animationDelay: `${i * 150}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75",
          sizeClasses[size]
        )} />
        <div className={cn(
          "relative rounded-full bg-primary-500",
          sizeClasses[size]
        )} />
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn("flex items-end space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary-500 rounded-sm animate-pulse",
              size === 'sm' && 'w-1 h-4',
              size === 'md' && 'w-1.5 h-6',
              size === 'lg' && 'w-2 h-8',
              size === 'xl' && 'w-3 h-12'
            )}
            style={{
              animationDelay: `${i * 100}ms`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <svg
        className="w-full h-full text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};
