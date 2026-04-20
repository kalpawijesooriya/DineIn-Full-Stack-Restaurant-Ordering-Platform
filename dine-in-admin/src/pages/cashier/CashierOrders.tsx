import { useCallback, useEffect, useState } from 'react';
import { completeOrder, getCashierOrders, processCashierPayment } from '@/api/cashierApi';
import { useSignalR } from '@/hooks/useSignalR';
import type { Order } from '@/types';
import Receipt from '../../components/Receipt';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
};

const TYPE_ICONS: Record<string, string> = {
  'dine-in': '🍽️',
  pickup: '🥡',
  delivery: '🚗',
};

export default function CashierOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const status = filter === 'active' ? undefined : filter;

    getCashierOrders(status)
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error loading orders'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(loadOrders, [loadOrders]);
  useSignalR(loadOrders);

  useEffect(() => {
    const handleAfterPrint = () => setPrintOrder(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleComplete = async (id: string) => {
    setCompleting(id);
    try {
      await completeOrder(id);
      loadOrders();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error completing order');
    }
    setCompleting(null);
  };

  const handleProcessPayment = async (orderId: string, payMethod: 'cash' | 'card', amtTendered?: number) => {
    try {
      await processCashierPayment(orderId, { paymentMethod: payMethod, amountTendered: amtTendered });
      setPaymentModal(null);
      loadOrders();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => window.print(), 200);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const grouped = {
    confirmed: orders.filter((o) => o.status === 'confirmed'),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready: orders.filter((o) => o.status === 'ready'),
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Orders</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'active', label: 'Active' },
              { key: 'ready', label: 'Ready' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'preparing', label: 'Preparing' },
              { key: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{orders.length} orders</span>
          <button onClick={loadOrders} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 bg-red-50 text-red-700 p-2.5 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400" aria-label="Dismiss error">
            &times;
          </button>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading orders...</div>
      ) : filter === 'active' ? (
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {(['confirmed', 'preparing', 'ready'] as const).map((status) => (
            <div key={status} className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[status]}`}>
                    {status}
                  </span>
                  <span className="text-xs text-gray-400">{grouped[status].length}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {grouped[status].map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onComplete={status === 'ready' ? () => handleComplete(order.id) : undefined}
                    onProcessPayment={() => setPaymentModal(order)}
                    onPrint={handlePrint}
                    completing={completing === order.id}
                    formatTime={formatTime}
                    timeAgo={timeAgo}
                  />
                ))}
                {grouped[status].length === 0 && <div className="text-center text-gray-300 text-sm py-8">No {status} orders</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onComplete={order.status === 'ready' ? () => handleComplete(order.id) : undefined}
                onProcessPayment={() => setPaymentModal(order)}
                onPrint={handlePrint}
                completing={completing === order.id}
                formatTime={formatTime}
                timeAgo={timeAgo}
              />
            ))}
          </div>
          {orders.length === 0 && <div className="text-center text-gray-400 py-12">No orders found</div>}
        </div>
      )}

      {paymentModal && (
        <PaymentModal
          order={paymentModal}
          onProcess={handleProcessPayment}
          onClose={() => setPaymentModal(null)}
        />
      )}

      {printOrder && <Receipt order={printOrder} />}
    </div>
  );
}

function OrderCard({
  order,
  onComplete,
  onProcessPayment,
  onPrint,
  completing,
  formatTime,
  timeAgo,
}: {
  order: Order;
  onComplete?: () => void;
  onProcessPayment: () => void;
  onPrint?: (order: Order) => void;
  completing: boolean;
  formatTime: (iso: string) => string;
  timeAgo: (iso: string) => string;
}) {
  const isUnpaid = order.paymentStatus === 'unpaid';

  return (
    <div className={`bg-white rounded-xl border-2 p-4 ${order.status === 'ready' ? 'border-green-300 shadow-md' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[order.orderType] || '📦'}</span>
          <span className="font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
          {order.status}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        {formatTime(order.createdAt)} · {timeAgo(order.createdAt)}
      </div>

      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-medium">{item.quantity}×</span> {item.menuItemName}
            </span>
            <span className="text-gray-500">${item.itemTotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="font-bold text-gray-800">${order.total.toFixed(2)}</span>
        {order.paymentMethod && (
          <span className="text-xs text-gray-400">
            {order.paymentMethod === 'cash'
              ? '💵 Cash'
              : order.paymentMethod === 'card'
                ? '💳 Card'
                : '⏱️ Pay Later'}
          </span>
        )}
      </div>

      {order.paymentStatus === 'unpaid' && (
        <div className="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          💰 Unpaid
        </div>
      )}
      {order.paymentStatus === 'paid' && (
        <div className="mt-2 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          ✅ Paid
        </div>
      )}

      {order.customerName && <div className="text-xs text-gray-500 mt-2">👤 {order.customerName}</div>}
      {order.tableNumber && <div className="text-xs text-gray-500 mt-1">🍽️ Table {order.tableNumber}</div>}

      {isUnpaid && (
        <button
          onClick={onProcessPayment}
          className="w-full mt-3 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all active:scale-[0.98]"
        >
          💳 Process Payment
        </button>
      )}

      {onComplete && (
        <button
          onClick={onComplete}
          disabled={completing || isUnpaid}
          className="w-full mt-3 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {completing ? 'Completing...' : '✓ Complete Order'}
        </button>
      )}

      {onPrint && (order.status === 'completed' || order.status === 'ready') && (
        <button
          onClick={() => onPrint(order)}
          className="w-full mt-3 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          🖨️ Print Bill
        </button>
      )}
    </div>
  );
}

function PaymentModal({
  order,
  onProcess,
  onClose,
}: {
  order: Order;
  onProcess: (orderId: string, method: 'cash' | 'card', amountTendered?: number) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [amount, setAmount] = useState('');
  const change = method === 'cash' && amount ? parseFloat(amount) - order.total : 0;
  const canPay = method === 'card' || (amount !== '' && parseFloat(amount) >= order.total);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-1">Process Payment</h3>
        <p className="text-sm text-gray-500 mb-4">Order #{order.id.slice(-6).toUpperCase()} - ${order.total.toFixed(2)}</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMethod('cash')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${
              method === 'cash' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            💵 Cash
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${
              method === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            💳 Card
          </button>
        </div>

        {method === 'cash' && (
          <div className="mb-4">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount Tendered"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />
            {amount && parseFloat(amount) >= order.total && (
              <div className="flex justify-between mt-1.5 text-green-700 font-semibold text-sm">
                <span>Change</span>
                <span>${change.toFixed(2)}</span>
              </div>
            )}
            {amount && parseFloat(amount) < order.total && (
              <p className="text-red-500 text-xs mt-1">Insufficient amount</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100">
            Cancel
          </button>
          <button
            onClick={() => canPay && onProcess(order.id, method, method === 'cash' ? parseFloat(amount) : undefined)}
            disabled={!canPay}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
