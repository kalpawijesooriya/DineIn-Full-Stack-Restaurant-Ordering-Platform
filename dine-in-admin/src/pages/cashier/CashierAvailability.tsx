import { useCallback, useEffect, useState } from 'react';
import {
  getCashierMenu,
  getCashierMenuItems,
  toggleCashierAvailability,
} from '@/api/cashierApi';
import type { Category, MenuItem } from '@/types';

export default function CashierAvailability() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');

    Promise.all([getCashierMenu(), getCashierMenuItems()])
      .then(([menu, menuItems]) => {
        setCategories(menu.categories);
        setItems(menuItems);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load menu availability');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (item: MenuItem) => {
    setToggling(item.id);
    try {
      const result = await toggleCashierAvailability(item.id, !item.isAvailable);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isAvailable: result.isAvailable } : i
        )
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update availability');
    } finally {
      setToggling(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(normalizedSearch)
  );

  const grouped = categories
    .map((category) => ({
      category,
      items: filtered.filter((i) => i.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const availableCount = items.filter((i) => i.isAvailable).length;
  const unavailableCount = items.length - availableCount;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading menu items...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">Menu Availability</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-green-600">✓ {availableCount} available</span>
              <span className="font-medium text-red-500">✗ {unavailableCount} unavailable</span>
            </div>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-64 rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-lg leading-none text-red-400"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {grouped.map(({ category, items: categoryItems }) => (
          <div key={category.id} className="mb-6 last:mb-0">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border-2 bg-white p-4 transition-all ${
                    item.isAvailable ? 'border-green-200' : 'border-red-200 opacity-75'
                  }`}
                >
                  <div className="mr-3 min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">${item.price.toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    disabled={toggling === item.id}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                      item.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                    } ${toggling === item.id ? 'opacity-50' : ''}`}
                    aria-label={`Set ${item.name} ${item.isAvailable ? 'unavailable' : 'available'}`}
                  >
                    <span
                      className={`absolute left-0 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        item.isAvailable ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            {normalizedSearch ? 'No items match your search' : 'No menu items found'}
          </div>
        )}
      </div>
    </div>
  );
}
