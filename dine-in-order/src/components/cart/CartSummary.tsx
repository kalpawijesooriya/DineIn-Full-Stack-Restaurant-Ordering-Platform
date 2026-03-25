import { formatCurrency } from '@/hooks/useFormatCurrency';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  total: number;
}

export function CartSummary({ subtotal, tax, deliveryFee = 0, total }: CartSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        {deliveryFee > 0 ? (
          <div className="flex items-center justify-between">
            <span>Delivery fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        ) : null}
      </div>
      <div className="my-3 h-px bg-slate-200" />
      <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </section>
  );
}
