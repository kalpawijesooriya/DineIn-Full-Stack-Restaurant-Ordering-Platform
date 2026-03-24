import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '@/api/adminApi';
import { useSignalR } from '@/hooks/useSignalR';
import type { DashboardData } from '@/types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);
  useSignalR(load);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  const stats = [
    { label: "Today's Orders", value: data.totalOrdersToday, color: 'bg-blue-500' },
    { label: "Today's Revenue", value: `$${data.revenueToday.toFixed(2)}`, color: 'bg-green-500' },
    { label: 'Active Orders', value: data.activeOrders, color: 'bg-orange-500' },
    { label: 'Completed Today', value: data.completedOrdersToday, color: 'bg-purple-500' },
    { label: 'Avg Order Value', value: `$${data.averageOrderValue.toFixed(2)}`, color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Real-time updates
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <div className={`h-1 w-12 ${s.color} rounded mt-3`} />
          </div>
        ))}
      </div>

      {/* Orders by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders by Type (Today)</h3>
          <div className="space-y-3">
            {Object.entries(data.ordersByType).map(([type, count]) => {
              const total = data.totalOrdersToday || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{type}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(data.ordersByType).length === 0 && (
              <p className="text-gray-400 text-sm">No orders today yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Orders</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-700">#{order.id.slice(0, 8)}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">{order.orderType}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={order.status} />
                  <span className="text-sm font-medium text-gray-800">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <p className="text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
