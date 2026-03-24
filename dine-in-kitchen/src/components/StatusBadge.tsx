import type { OrderStatus } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'New', className: 'bg-blue-500 text-white' },
  preparing: { label: 'Preparing', className: 'bg-amber-500 text-white' },
  ready: { label: 'Ready', className: 'bg-green-500 text-white' },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-500 text-white',
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
