import { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';
import { HUB_URL } from '@/api/client';
import type { Order } from '@/types';
import { useOrderStore } from '@/store/orderStore';

interface UseOrderTrackingResult {
  isConnected: boolean;
}

export function useOrderTracking(orderId: string | null | undefined): UseOrderTrackingResult {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const updateOrder = useOrderStore((state) => state.updateOrder);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('OrderUpdated', (updatedOrder: Order) => {
      if (updatedOrder?.id !== orderId) {
        return;
      }

      updateOrder(updatedOrder);
    });

    connection.onreconnecting(() => {
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
    });

    connection.onclose(() => {
      setIsConnected(false);
    });

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((error) => {
        console.error('SignalR connection failed', error);
        setIsConnected(false);
      });

    return () => {
      setIsConnected(false);
      connection.off('OrderUpdated');
      void connection.stop();
    };
  }, [orderId, updateOrder]);

  return {
    isConnected,
  };
}
