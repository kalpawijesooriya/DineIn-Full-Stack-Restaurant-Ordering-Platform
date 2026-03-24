import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';
import { HUB_URL } from '@/api/client';

export function useSignalR(onOrderChange: () => void) {
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('OrderCreated', onOrderChange);
    connection.on('OrderUpdated', onOrderChange);

    connection.start().catch(console.error);

    return () => {
      connection.stop();
    };
  }, [onOrderChange]);

  return connectionRef;
}
