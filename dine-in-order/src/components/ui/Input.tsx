import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, id, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus-visible:ring-2 ${
          error
            ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200'
            : 'border-slate-300 focus-visible:border-primary focus-visible:ring-primary/20'
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />

      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={helperId} className="text-sm text-slate-500">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

export type { InputProps };
