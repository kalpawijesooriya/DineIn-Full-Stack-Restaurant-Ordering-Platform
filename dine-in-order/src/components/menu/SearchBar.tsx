import { useId } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputId = useId();

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search menu
      </label>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16.65 16.65" />
        </svg>
      </span>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search menu..."
        className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
