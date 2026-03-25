interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max, onChange }: QuantitySelectorProps) {
  const canDecrease = value > min;
  const canIncrease = max ? value < max : true;

  return (
    <div className="inline-flex items-center rounded-full border border-slate-300 bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        className="h-9 w-9 rounded-l-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-slate-900" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        className="h-9 w-9 rounded-r-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
