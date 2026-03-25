import { Link, useNavigate } from 'react-router-dom';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { useCartStore } from '@/store/cartStore';

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 1 1 6 0v2" />
    </svg>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = useCartStore((state) => state.getSubtotal());
  const tax = useCartStore((state) => state.getTax());
  const deliveryFee = useCartStore((state) => state.getDeliveryFee());
  const total = useCartStore((state) => state.getTotal());

  const handleRemove = (id: string) => {
    removeItem(id);
    showToast('Item removed', 'info');
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Your Cart</h1>
        <EmptyState
          icon={<ShoppingBagIcon />}
          title="Your cart is empty"
          description="Browse our menu to add items"
          actionLabel="Browse Menu"
          onAction={() => navigate('/menu')}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>

      <section className="space-y-3" aria-label="Cart items">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={handleRemove}
          />
        ))}
      </section>

      <CartSummary subtotal={subtotal} tax={tax} deliveryFee={orderType === 'delivery' ? deliveryFee : 0} total={total} />

      <div className="space-y-3">
        <Button fullWidth onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>

        <p className="text-center text-sm text-slate-600">
          <Link to="/menu" className="font-medium text-primary hover:text-primary-dark">
            Continue Shopping
          </Link>
        </p>
      </div>
    </main>
  );
}
