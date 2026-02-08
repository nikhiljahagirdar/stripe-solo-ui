import { ReactNode } from 'react';

interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error';
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly outline?: boolean;
}

export default function Badge({ children, variant, size, outline }: BadgeProps) {
  const variantClasses = {
    neutral: outline ? 'border border-neutral-300 text-neutral-700 bg-neutral-100' : 'bg-neutral-100 text-neutral-700',
    primary: outline ? 'border border-primary text-primary bg-primary/10' : 'bg-primary text-white',
    secondary: outline ? 'border border-secondary text-secondary bg-secondary/10' : 'bg-secondary text-white',
    accent: outline ? 'border border-accent text-accent bg-accent/10' : 'bg-accent text-white',
    ghost: 'bg-neutral-100 text-neutral-700',
    info: outline ? 'border border-info text-info bg-info/10' : 'bg-info text-white',
    success: outline ? 'border border-success text-success bg-success/10' : 'bg-success text-white',
    warning: outline ? 'border border-warning text-warning bg-warning/10' : 'bg-warning text-white',
    error: outline ? 'border border-error text-error bg-error/10' : 'bg-error text-white',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClass = variant ? variantClasses[variant] : variantClasses.neutral;
  const sizeClass = size ? sizeClasses[size] : sizeClasses.md;

  return (
    <div className={`inline-flex items-center rounded-full font-medium ${variantClass} ${sizeClass}`}>
      {children}
    </div>
  );
}