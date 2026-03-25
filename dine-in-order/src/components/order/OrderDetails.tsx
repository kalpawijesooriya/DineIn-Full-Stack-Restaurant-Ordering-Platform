import { formatCurrency } from '@/hooks/useFormatCurrency';
import { Badge } from '@/components/ui/Badge';
import type { CartItem, Order, PaymentMethodType } from '@/types';

interface OrderDetailsProps {
  order: Order;
}

const paymentMethodLabels: Record<PaymentMethodType, string> = {
  card: 'Card',
  cashOnDelivery: 'Cash on Delivery',
  payAtCounter: 'Pay at Counter',
  none: 'Not Selected',
};

function getOrderTypeLabel(orderType: Order['orderType']): string {
  if (orderType === 'dine-in') {
    return 'Dine-In';
  }

  if (orderType === 'pickup') {
    return 'Pickup';
  }

  return 'Delivery';
}

function getCustomizationSummary(item: CartItem): string {
  const labels: string[] = [];

  for (const group of item.menuItem.customizationGroups) {
    const optionIds = item.selectedCustomizations[group.id] ?? [];
    for (const optionId of optionIds) {
      const option = group.options.find((groupOption) => groupOption.id === optionId);
      if (option) {
        labels.push(option.name);
      }
    }
  }

  return labels.join(', ');
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const details = order.orderTypeDetails;
  const deliveryFee = details.type === 'delivery' ? details.deliveryFee : 0;
  const paymentStatus =
    order.paymentMethod === 'card' ? (order.paymentIntentId ? 'Paid' : 'Pending') : 'Pay on fulfillment';

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex flex-wrap items-center gap-2">
        <Badge>{getOrderTypeLabel(order.orderType)}</Badge>
        <Badge variant="default">Order #{order.id}</Badge>
      </header>

      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        {details.type === 'dine-in' ? (
          <p>
            <span className="font-semibold text-slate-900">Table:</span> {details.tableNumber}
          </p>
        ) : (
          <>
            <p>
              <span className="font-semibold text-slate-900">Customer:</span> {details.customerName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Phone:</span> {details.phoneNumber}
            </p>
          </>
        )}

        {details.type === 'delivery' ? (
          <p className="md:col-span-2">
            <span className="font-semibold text-slate-900">Delivery Address:</span> {details.address.street}, {details.address.city},{' '}
            {details.address.zip}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-slate-900">Items</h3>
        <ul className="space-y-2">
          {order.items.map((item) => {
            const customizationSummary = getCustomizationSummary(item);

            return (
              <li key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.quantity}x {item.menuItem.name}
                    </p>
                    {customizationSummary ? <p className="text-sm text-slate-600">{customizationSummary}</p> : null}
                    {item.specialInstructions ? (
                      <p className="text-sm italic text-slate-500">&quot;{item.specialInstructions}&quot;</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.itemTotal)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between py-1">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        {deliveryFee > 0 ? (
          <div className="flex justify-between py-1">
            <span>Delivery Fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        ) : null}
        <div className="my-2 h-px bg-slate-200" />
        <div className="flex justify-between py-1 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-900">Payment Method:</span> {paymentMethodLabels[order.paymentMethod]}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Payment Status:</span> {paymentStatus}
        </p>
        <p className="md:col-span-2">
          <span className="font-semibold text-slate-900">Created:</span>{' '}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </section>
  );
}
