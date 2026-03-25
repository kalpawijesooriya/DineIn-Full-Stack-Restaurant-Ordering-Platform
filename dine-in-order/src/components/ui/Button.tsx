import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:opacity-90',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

function mergeClasses(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={mergeClasses(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export type { ButtonProps };
