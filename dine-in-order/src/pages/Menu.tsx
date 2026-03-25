import { useEffect, useMemo, useState } from 'react';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { ItemDetailModal } from '@/components/menu/ItemDetailModal';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { SearchBar } from '@/components/menu/SearchBar';
import { EmptyState, Skeleton } from '@/components/ui';
import { useMenu } from '@/hooks/useMenu';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h12" />
      <path d="M4 18h8" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.35-5.65" />
      <path d="M20 4v6h-6" />
    </svg>
  );
}

export default function Menu() {
  const { categories, items, loading, error, getItemsByCategory } = useMenu();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.length > 0 && activeCategory !== null) {
      setActiveCategory(null);
    }
  }, [activeCategory, debouncedSearchQuery]);

  const visibleItems = useMemo(() => {
    const baseItems = activeCategory ? getItemsByCategory(activeCategory) : items;
    if (!debouncedSearchQuery) {
      return baseItems;
    }

    const searchTerm = debouncedSearchQuery.toLowerCase();
    return baseItems.filter((item) => {
      return item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm);
    });
  }, [activeCategory, debouncedSearchQuery, getItemsByCategory, items]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <Skeleton height={44} className="rounded-full" />
          <Skeleton height={40} className="rounded-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
                <Skeleton variant="card" className="h-56 rounded-xl" />
                <Skeleton width="65%" />
                <Skeleton />
                <Skeleton width="35%" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          icon={<RetryIcon />}
          title="We couldn't load the menu"
          description={error}
          actionLabel="Try again"
          onAction={() => window.location.reload()}
        />
      </main>
    );
  }

  const hasSearch = debouncedSearchQuery.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="mb-4 sm:mb-5">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      <section className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </section>

      <section className="mt-5">
        {visibleItems.length === 0 ? (
          hasSearch ? (
            <EmptyState
              icon={<SearchIcon />}
              title="No items found"
              description="Try a different keyword or clear the search to see more menu options."
            />
          ) : (
            <EmptyState
              icon={<MenuIcon />}
              title="No menu items in this category"
              description="This section is empty right now. Try another category."
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {visibleItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItemId(item.id)} />
            ))}
          </div>
        )}
      </section>

      <ItemDetailModal
        itemId={selectedItemId}
        isOpen={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
      />
    </main>
  );
}