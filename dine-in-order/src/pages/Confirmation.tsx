import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { getOrderById } from '@/api/orderApi';
import type { Order } from '@/types';

function getOrderTypeLabel(orderType: Order['orderType']): string {
  if (orderType === 'dine-in') {
    return 'Dine-In';
  }

  if (orderType === 'pickup') {
    return 'Pickup';
  }

  return 'Delivery';
}

function CheckIcon() {
  return (
    <div className="mx-auto mb-4 h-20 w-20 animate-[check-scale-in_320ms_ease-out] rounded-full bg-emerald-100 p-4 text-emerald-600">
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await getOrderById(id);
        if (!isMounted) {
          return;
        }

        setOrder(data);
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
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton variant="circle" className="mx-auto h-20 w-20" />
          <Skeleton variant="text" width="50%" className="mx-auto" />
          <Skeleton variant="text" width="70%" className="mx-auto" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </main>
    );
  }

  if (error || !order) {
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
          description="We could not find this order. Please check and try again."
          actionLabel="Back Home"
          onAction={() => navigate('/')}
        />
      </main>
    );
  }

  const shortOrderNumber = order.id.slice(0, 8).toUpperCase();
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <CheckIcon />

        <h1 className="text-3xl font-bold text-slate-900">Order Placed!</h1>

        <p className="mt-2 text-sm text-slate-600">Order Number</p>
        <p className="mt-1 text-3xl font-extrabold tracking-wider text-primary">#{shortOrderNumber}</p>

        <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {getOrderTypeLabel(order.orderType)}
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
          <p>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Items</span>
            <span className="font-semibold text-slate-900">{itemCount}</span>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Total</span>
            <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Created</span>
            <span className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleString()}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate(`/tracker/${order.id}`)}>Track Your Order</Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Order Again
          </Button>
        </div>

        <style>{`@keyframes check-scale-in { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </section>
    </main>
  );
}
