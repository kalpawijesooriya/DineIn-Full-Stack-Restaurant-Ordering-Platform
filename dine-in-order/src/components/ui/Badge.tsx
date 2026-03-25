import type { ReactNode } from 'react';

type BadgeVariant =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'default'
  | 'success'
  | 'warning'
  | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  preparing: 'bg-status-preparing/15 text-status-preparing',
  ready: 'bg-status-ready/15 text-status-ready',
  completed: 'bg-status-completed/15 text-status-completed',
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
