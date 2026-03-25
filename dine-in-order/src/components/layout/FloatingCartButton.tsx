import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { useCartStore } from '@/store/cartStore';

export function FloatingCartButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  const hideOnCurrentRoute = pathname === '/cart' || pathname === '/checkout';
  if (itemCount === 0 || hideOnCurrentRoute) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/cart')}
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 animate-[floating-cart-in_280ms_ease-out] items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label="View cart"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M6.75 7.5h10.5l-1 9H7.75l-1-9Zm2-2.25a3.25 3.25 0 0 1 6.5 0v2.25h-1.5V5.25a1.75 1.75 0 0 0-3.5 0v2.25h-1.5V5.25Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <span>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
      <span className="h-4 w-px bg-white/40" aria-hidden="true" />
      <span>{formatCurrency(total)}</span>

      <style>{`@keyframes floating-cart-in { from { opacity: 0; transform: translateX(-50%) translateY(16px);} to { opacity: 1; transform: translateX(-50%) translateY(0);} }`}</style>
    </button>
  );
}
