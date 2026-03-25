import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

export function Header() {
  const navigate = useNavigate();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Dine-In
        </Link>

        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Open cart"
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

          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
