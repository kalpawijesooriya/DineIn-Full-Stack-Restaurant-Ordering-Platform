import type { Order, OrderStatus } from '@/types';

import { OrderCard } from './OrderCard';

interface OrderColumnProps {
  title: string;
  icon: string;
  orders: Order[];
  colorClass: string;
  newOrderIds: Set<string>;
  onAdvance: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderColumn({
  title,
  icon,
  orders,
  colorClass,
  newOrderIds,
  onAdvance,
}: OrderColumnProps) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className={`flex items-center gap-2 rounded-t-xl px-4 py-3 ${colorClass}`}>
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-bold text-white">
          {orders.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-b-xl bg-gray-800/30 p-3">
        {orders.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">No orders</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newOrderIds.has(order.id)}
              onAdvance={onAdvance}
            />
          ))
        )}
      </div>
    </div>
  );
}
