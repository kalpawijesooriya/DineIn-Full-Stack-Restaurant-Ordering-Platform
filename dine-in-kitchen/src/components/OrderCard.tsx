import { useState } from 'react';

import type { Order, OrderStatus } from '@/types';

import { ElapsedTime } from './ElapsedTime';
import { OrderItemList } from './OrderItemList';
import { OrderTypeBadge } from './OrderTypeBadge';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: Order;
  isNew?: boolean;
  onAdvance: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

function getOrderIdentifier(order: Order): string {
  const details = order.orderTypeDetails;

  if (details.type === 'dine-in') {
    return `Table #${details.tableNumber}`;
  }

  if (details.type === 'pickup') {
    return details.customerName;
  }

  if (details.type === 'delivery') {
    return `${details.customerName} • ${details.address?.street ?? ''}`;
  }

  return '';
}

function getNextStatus(current: OrderStatus): OrderStatus | null {
  if (current === 'confirmed') {
    return 'preparing';
  }

  if (current === 'preparing') {
    return 'ready';
  }

  return null;
}

function getActionLabel(current: OrderStatus): string | null {
  if (current === 'confirmed') {
    return '🔥 Start Preparing';
  }

  if (current === 'preparing') {
    return '✅ Mark Ready';
  }

  return null;
}

function getActionColor(current: OrderStatus): string {
  if (current === 'confirmed') {
    return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700';
  }

  if (current === 'preparing') {
    return 'bg-green-500 hover:bg-green-600 active:bg-green-700';
  }

  return 'bg-gray-500';
}

function getBorderColor(order: Order): string {
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  if (order.status === 'ready') {
    return 'border-green-500/50';
  }

  if (minutes >= 15) {
    return 'border-red-500/50';
  }

  if (minutes >= 10) {
    return 'border-yellow-500/50';
  }

  return 'border-gray-700';
}

export function OrderCard({ order, isNew, onAdvance }: OrderCardProps) {
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orderId = `#${order.id.slice(-6).toUpperCase()}`;
  const nextStatus = getNextStatus(order.status);
  const actionLabel = getActionLabel(order.status);

  const handleAdvance = async () => {
    if (!nextStatus || advancing) {
      return;
    }

    setAdvancing(true);

    try {
      await onAdvance(order.id, nextStatus);
    } catch (e) {
      console.error('Failed to advance order:', e);
      setError(e instanceof Error ? e.message : 'Failed to update order status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div
      className={`rounded-xl border-2 ${getBorderColor(order)} bg-gray-800 p-4 transition-all duration-300 ${
        isNew ? 'ring-2 ring-blue-400 animate-pulse' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{orderId}</span>
          <StatusBadge status={order.status} />
        </div>
        <ElapsedTime createdAt={order.createdAt} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <OrderTypeBadge orderType={order.orderType} />
        <span className="truncate text-sm font-medium text-gray-300">{getOrderIdentifier(order)}</span>
      </div>

      <OrderItemList items={order.items} />

      <div className="mt-3 flex items-center justify-between border-t border-gray-700 pt-2">
        <span className="text-sm text-gray-400">{order.items.length} item(s)</span>
        <span className="font-bold text-white">${order.total.toFixed(2)}</span>
      </div>

      {error && (
        <div className="mt-2 rounded-lg bg-red-900/50 border border-red-500/50 px-3 py-2 text-sm text-red-200">
          ⚠️ {error}
        </div>
      )}

      {actionLabel && nextStatus && (
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className={`mt-3 w-full rounded-lg py-3 text-base font-bold text-white transition-colors ${getActionColor(order.status)} ${
            advancing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {advancing ? 'Updating...' : actionLabel}
        </button>
      )}
    </div>
  );
}
