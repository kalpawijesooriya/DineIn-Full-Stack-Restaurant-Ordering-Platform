import type { OrderType } from '@/types';

const config: Record<OrderType, { emoji: string; label: string; bgClass: string }> = {
  'dine-in': {
    emoji: '🍽️',
    label: 'Dine-in',
    bgClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  pickup: {
    emoji: '🛍️',
    label: 'Pickup',
    bgClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  delivery: {
    emoji: '🚗',
    label: 'Delivery',
    bgClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
};

interface OrderTypeBadgeProps {
  orderType: OrderType;
}

export function OrderTypeBadge({ orderType }: OrderTypeBadgeProps) {
  const { emoji, label, bgClass } = config[orderType] ?? config['dine-in'];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${bgClass}`}
    >
      {emoji} {label}
    </span>
  );
}
