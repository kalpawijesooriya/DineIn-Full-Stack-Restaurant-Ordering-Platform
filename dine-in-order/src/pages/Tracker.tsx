import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById } from '@/api/orderApi';
import { OrderDetails } from '@/components/order/OrderDetails';
import { OrderProgressStepper } from '@/components/order/OrderProgressStepper';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { ESTIMATED_DELIVERY_MINUTES, ESTIMATED_PICKUP_MINUTES } from '@/constants/config';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useOrderStore } from '@/store/orderStore';
import type { Order } from '@/types';

function toStatusLabel(status: Order['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentOrder = useOrderStore((state) => state.currentOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useOrderTracking(id);

  const lastStatusRef = useRef<Order['status'] | null>(null);
  const initializedStatusRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setError('Order not found');
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const order = await getOrderById(id);
        if (!isMounted) {
          return;
        }

        setCurrentOrder(order);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Order not found');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      isMounted = false;
      setCurrentOrder(null);
      initializedStatusRef.current = false;
      lastStatusRef.current = null;
    };
  }, [id, setCurrentOrder]);

  useEffect(() => {
    if (!currentOrder) {
      return;
    }

    if (!initializedStatusRef.current) {
      initializedStatusRef.current = true;
      lastStatusRef.current = currentOrder.status;
      return;
    }

    if (lastStatusRef.current !== currentOrder.status) {
      lastStatusRef.current = currentOrder.status;
      showToast(`Order status updated to ${toStatusLabel(currentOrder.status)}`, 'info');
    }
  }, [currentOrder, showToast]);

  const estimatedTimeText = useMemo(() => {
    if (!currentOrder || currentOrder.status === 'completed') {
      return null;
    }

    if (currentOrder.orderType === 'delivery') {
      return `Estimated delivery in ~${ESTIMATED_DELIVERY_MINUTES} min`;
    }

    return `Estimated ready in ~${ESTIMATED_PICKUP_MINUTES} min`;
  }, [currentOrder]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-72" />
      </main>
    );
  }

  if (error || !currentOrder) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
          }
          title="Order not found"
          description="We could not load this order right now."
          actionLabel="Back to Home"
          onAction={() => navigate('/')}
        />
      </main>
    );
  }

  const isCompleted = currentOrder.status === 'completed';

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Track Order</h1>

        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
            aria-hidden="true"
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </p>
      </header>

      <OrderProgressStepper currentStatus={currentOrder.status} />

      {estimatedTimeText ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {estimatedTimeText}
        </section>
      ) : null}

      <OrderDetails order={currentOrder} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => navigate('/')}>Back to Home</Button>
        {isCompleted ? (
          <Button variant="outline" onClick={() => navigate('/')}>
            Order Again
          </Button>
        ) : null}
      </div>
    </main>
  );
}
