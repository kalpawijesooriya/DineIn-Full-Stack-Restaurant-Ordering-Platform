import { formatCurrency } from '@/hooks/useFormatCurrency';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function getCustomizationSummary(item: CartItem): string {
  const labels: string[] = [];

  for (const group of item.menuItem.customizationGroups) {
    const selectedOptionIds = item.selectedCustomizations[group.id] ?? [];

    for (const optionId of selectedOptionIds) {
      const option = group.options.find((groupOption) => groupOption.id === optionId);
      if (option) {
        labels.push(option.name);
      }
    }
  }

  return labels.join(', ');
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const customizationSummary = getCustomizationSummary(item);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate font-semibold text-slate-900">{item.menuItem.name}</h3>
          {customizationSummary ? <p className="text-sm text-slate-600">{customizationSummary}</p> : null}
          {item.specialInstructions ? (
            <p className="text-sm italic text-slate-500">&quot;{item.specialInstructions}&quot;</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <QuantitySelector value={item.quantity} onChange={(quantity) => onUpdateQuantity(item.id, quantity)} />
          <p className="min-w-20 text-right text-sm font-semibold text-slate-900">{formatCurrency(item.itemTotal)}</p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${item.menuItem.name}`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6H21" />
              <path d="M8 6V4H16V6" />
              <path d="M19 6L18 20H6L5 6" />
              <path d="M10 11V17" />
              <path d="M14 11V17" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
