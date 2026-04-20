import type { Order } from '@/types';

type ReceiptProps = {
  order: Order;
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  'dine-in': 'Dine-In',
  pickup: 'Pickup',
  delivery: 'Delivery',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  none: 'Pay Later',
};

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Receipt({ order }: ReceiptProps) {
  const orderNumber = order.id.slice(-6).toUpperCase();
  const orderTypeLabel = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;
  const paymentMethod = order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod : null;
  const isCashPayment = order.paymentMethod === 'cash';
  const showTable = order.orderType === 'dine-in' && typeof order.tableNumber === 'number';
  const showCustomer = !showTable && Boolean(order.customerName);

  return (
    <div id="receipt-print-area" className="hidden print:block">
      <div className="w-[302px] bg-white p-3 text-[12px] leading-5 text-black font-mono">
        <div className="text-center text-base font-bold">Dine-In Restaurant</div>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="space-y-1">
          <div className="flex justify-between gap-2">
            <span>Order #:</span>
            <span className="font-semibold">{orderNumber}</span>
          </div>

          <div className="flex justify-between gap-2">
            <span>Type:</span>
            <span>{orderTypeLabel}</span>
          </div>

          {showTable ? (
            <div className="flex justify-between gap-2">
              <span>Table:</span>
              <span>{order.tableNumber}</span>
            </div>
          ) : null}

          {showCustomer ? (
            <div className="flex justify-between gap-2">
              <span>Customer:</span>
              <span className="truncate text-right">{order.customerName}</span>
            </div>
          ) : null}

          <div className="flex justify-between gap-2">
            <span>Date:</span>
            <span className="text-right">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2">
              <span className="break-words">
                <span className="font-semibold">{item.quantity}×</span> {item.menuItemName}
              </span>
              <span className="shrink-0 text-right">{formatCurrency(item.itemTotal)}</span>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="space-y-1">
          <div className="flex justify-between gap-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Tax:</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between gap-2 text-sm font-bold">
            <span>Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {paymentMethod ? (
          <div className="mt-2 flex justify-between gap-2">
            <span>Payment:</span>
            <span>{paymentMethod}</span>
          </div>
        ) : null}

        {isCashPayment && typeof order.amountTendered === 'number' ? (
          <div className="mt-1 flex justify-between gap-2">
            <span>Tendered:</span>
            <span>{formatCurrency(order.amountTendered)}</span>
          </div>
        ) : null}

        {isCashPayment && typeof order.changeGiven === 'number' ? (
          <div className="mt-1 flex justify-between gap-2">
            <span>Change:</span>
            <span>{formatCurrency(order.changeGiven)}</span>
          </div>
        ) : null}

        <div className="my-2 border-t border-dashed border-black" />

        <div className="text-center font-semibold">Thank you for dining with us!</div>
        <div className="mt-1 text-center text-[10px]">Powered by Dine-In</div>
      </div>
    </div>
  );
}