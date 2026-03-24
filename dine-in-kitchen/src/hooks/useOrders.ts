import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { getKitchenOrders, updateOrderStatus } from '@/api/ordersApi';
import type { Order, OrderStatus } from '@/types';

const HUB_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5038/api').replace(/\/api$/, '') + '/hubs/orders';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  newOrderIds: Set<string>;
  advanceOrder: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

function isActiveOrder(order: Order): boolean {
  return order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready';
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);

  // Initial fetch to load existing orders
  const fetchOrders = useCallback(async () => {
    try {
      const data = await getKitchenOrders();
      const activeOrders = data.filter(isActiveOrder);
      setOrders(activeOrders);
      setError(null);

      // Mark all existing orders as seen on initial load
      if (!initialLoadDoneRef.current) {
        activeOrders.forEach((o) => seenOrderIdsRef.current.add(o.id));
        initialLoadDoneRef.current = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // SignalR connection
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('OrderCreated', (order: Order) => {
      if (!isActiveOrder(order)) return;

      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [...prev, order];
      });

      // Highlight new order
      if (!seenOrderIdsRef.current.has(order.id)) {
        seenOrderIdsRef.current.add(order.id);
        setNewOrderIds((prev) => new Set(prev).add(order.id));
        setTimeout(() => {
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            next.delete(order.id);
            return next;
          });
        }, 5000);
      }
    });

    connection.on('OrderUpdated', (order: Order) => {
      if (isActiveOrder(order)) {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === order.id);
          if (exists) {
            return prev.map((o) => (o.id === order.id ? order : o));
          }
          return [...prev, order];
        });
      } else {
        // Order moved to completed/cancelled — remove from active list
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    });

    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => {
      setConnected(true);
      // Re-fetch on reconnect to sync any missed events
      fetchOrders();
    });
    connection.onclose(() => setConnected(false));

    // Start connection
    fetchOrders();
    connection
      .start()
      .then(() => setConnected(true))
      .catch((err) => {
        console.error('SignalR connection failed:', err);
        setConnected(false);
      });

    // Re-fetch when tab becomes visible (to catch anything missed while hidden)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
        if (connection.state !== HubConnectionState.Connected) {
          connection.start().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      connection.stop();
    };
  }, [fetchOrders]);

  const advanceOrder = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        const updated = await updateOrderStatus(orderId, newStatus);
        // Optimistic update — the SignalR event will also fire, but this is faster
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      } catch (err) {
        console.error(`Failed to advance order ${orderId} to ${newStatus}:`, err);
        await fetchOrders();
        throw err;
      }
    },
    [fetchOrders]
  );

  return { orders, loading, error, connected, newOrderIds, advanceOrder };
}