import { useCallback, useEffect, useState } from 'react';
import { getOrders } from '@/api/adminApi';
import { useSignalR } from '@/hooks/useSignalR';
import type { Order } from '@/types';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'completed'];
const TYPE_OPTIONS = ['', 'dinein', 'pickup', 'delivery'];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    getOrders({
      status: status || undefined,
      type: type || undefined,
      from: from || undefined,
      to: to || undefined,
    }).then(setOrders).catch((e) => setError(e.message));
  }, [status, type, from, to]);

  useEffect(load, [load]);
  useSignalR(load);

  const statusColor: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
  };

  const typeEmoji: Record<string, string> = {
    'dine-in': '🍽️',
    pickup: '🥡',
    delivery: '🚗',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <label className="block">
          <span className="text-xs text-gray-500">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm">
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t || 'All'}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm" />
        </label>
        <span className="text-sm text-gray-500 ml-auto">{orders.length} orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap">{typeEmoji[order.orderType] || ''} <span className="capitalize">{order.orderType}</span></span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.items.length} items</td>
                  <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">{expanded === order.id ? '▲' : '▼'}</td>
                </tr>
                {expanded === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-2 font-medium">Order Items</p>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between py-1">
                              <span>{item.quantity}x {item.menuItemName}</span>
                              <span className="text-gray-600">${item.itemTotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-gray-500 mb-2 font-medium">Summary</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Subtotal</span>
                              <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tax</span>
                              <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                              <span>Total</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                            {order.customerName && (
                              <p className="mt-2 text-gray-500">Customer: {order.customerName}</p>
                            )}
                            {order.tableNumber && (
                              <p className="text-gray-500">Table: {order.tableNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
