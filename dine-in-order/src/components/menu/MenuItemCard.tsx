import { formatCurrency } from '@/hooks/useFormatCurrency';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!item.isAvailable}
      className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed"
    >
      <div className="relative mb-3 overflow-hidden rounded-xl">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" />
        ) : (
          <div className="aspect-square w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" aria-hidden="true" />
        )}
        {!item.isAvailable ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55">
            <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-700">Unavailable</span>
          </div>
        ) : null}
      </div>
      <h3 className="font-semibold text-slate-900">{item.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
      <p className="mt-3 text-base font-semibold text-primary">{formatCurrency(item.price)}</p>
    </button>
  );
}
