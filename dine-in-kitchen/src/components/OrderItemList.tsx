import type { OrderItem } from '@/types';

interface OrderItemListProps {
  items: OrderItem[];
}

export function OrderItemList({ items }: OrderItemListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const customizationNames: string[] = [];

        if (item.selectedCustomizations && item.menuItem?.customizationGroups) {
          Object.entries(item.selectedCustomizations).forEach(([groupId, optionIds]) => {
            const group = item.menuItem.customizationGroups?.find((g) => g.id === groupId);

            if (group) {
              optionIds.forEach((optId) => {
                const opt = group.options?.find((o) => o.id === optId);
                if (opt) {
                  customizationNames.push(opt.name);
                }
              });
            }
          });
        }

        return (
          <div key={item.id} className="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <span className="text-base font-semibold text-white">
                {item.quantity}x {item.menuItem?.name ?? 'Unknown Item'}
              </span>
            </div>

            {customizationNames.length > 0 && (
              <p className="mt-0.5 text-sm text-gray-400">{customizationNames.join(', ')}</p>
            )}

            {item.specialInstructions && (
              <p className="mt-1 rounded bg-yellow-500/10 px-2 py-1 text-sm italic text-yellow-300">
                ⚠️ {item.specialInstructions}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
