import { useEffect, useMemo } from 'react';

import { OrderColumn } from '@/components/OrderColumn';
import { useOrders } from '@/hooks/useOrders';
import { useSound } from '@/hooks/useSound';

function App() {
  const { orders, loading, connected, newOrderIds, advanceOrder } = useOrders();
  const { play, muted, toggleMute } = useSound();

  useEffect(() => {
    if (newOrderIds.size > 0) {
      play();
    }
  }, [newOrderIds, play]);

  const confirmedOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'confirmed')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders]
  );

  const preparingOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'preparing')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders]
  );

  const readyOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'ready')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
      <header className="shrink-0 border-b border-gray-700 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              👨‍🍳
            </span>
            <h1 className="text-3xl font-extrabold tracking-wide">Kitchen Display</h1>
          </div>

          <div className="flex items-center gap-5 text-base">
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
              <div
                className={`h-3 w-3 rounded-full ${connected ? 'bg-green-400' : 'animate-pulse bg-red-400'}`}
              />
              <span className="font-semibold text-gray-200">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-semibold text-gray-200">
              Real-time updates
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-200">
              <span className="font-bold text-white">{orders.length}</span> active orders
            </div>

            <button
              onClick={toggleMute}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
              title={muted ? 'Unmute notifications' : 'Mute notifications'}
            >
              <span>{muted ? '🔇' : '🔔'}</span>
              <span>{muted ? 'Muted' : 'Sound On'}</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-400" />
            <p className="text-xl font-medium text-gray-300">Loading kitchen orders...</p>
          </div>
        </div>
      ) : (
        <main className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden bg-gray-950 p-4">
          <OrderColumn
            title="New Orders"
            icon="📋"
            orders={confirmedOrders}
            colorClass="bg-blue-600"
            newOrderIds={newOrderIds}
            onAdvance={advanceOrder}
          />

          <OrderColumn
            title="Preparing"
            icon="🔥"
            orders={preparingOrders}
            colorClass="bg-amber-600"
            newOrderIds={newOrderIds}
            onAdvance={advanceOrder}
          />

          <OrderColumn
            title="Ready"
            icon="✅"
            orders={readyOrders}
            colorClass="bg-green-600"
            newOrderIds={newOrderIds}
            onAdvance={advanceOrder}
          />
        </main>
      )}
    </div>
  );
}

export default App;
