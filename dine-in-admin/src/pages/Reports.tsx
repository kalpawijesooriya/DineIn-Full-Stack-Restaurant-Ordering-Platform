import { useEffect, useState } from 'react';
import { getRevenueReport } from '@/api/adminApi';
import type { RevenueReport as RevenueReportType } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [report, setReport] = useState<RevenueReportType | null>(null);
  const [error, setError] = useState('');
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getRevenueReport(from, to).then(setReport).catch((e) => setError(e.message));
  }, [from, to]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!report) return <div className="p-8 text-gray-500">Loading report...</div>;

  const pieData = Object.entries(report.ordersByType).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(report.ordersByStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Reports</h2>

      {/* Date Range */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-end gap-4">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${report.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-indigo-600">{report.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-3xl font-bold text-orange-500">${report.averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Daily Revenue</h3>
        {report.dailyBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-12">No data in selected range</p>
        )}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders by Type</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Daily Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium text-right">Orders</th>
              <th className="pb-2 font-medium text-right">Revenue</th>
              <th className="pb-2 font-medium text-right">Avg/Order</th>
            </tr>
          </thead>
          <tbody>
            {report.dailyBreakdown.map((d) => (
              <tr key={d.date} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 text-gray-700">{d.date}</td>
                <td className="py-2 text-right text-gray-600">{d.orderCount}</td>
                <td className="py-2 text-right font-medium text-gray-800">${d.revenue.toFixed(2)}</td>
                <td className="py-2 text-right text-gray-600">
                  ${d.orderCount > 0 ? (d.revenue / d.orderCount).toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
            {report.dailyBreakdown.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-gray-400">No data in selected range</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
