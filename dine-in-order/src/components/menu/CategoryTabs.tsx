import type { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const tabs = [{ id: null as string | null, name: 'All' }, ...categories.map((category) => ({ id: category.id, name: category.name }))];

  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="inline-flex min-w-full gap-2 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id ?? 'all'}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onCategoryChange(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50'
              }`}
            >
              <span className="border-b-2 border-transparent pb-0.5 data-[active=true]:border-white" data-active={isActive}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
