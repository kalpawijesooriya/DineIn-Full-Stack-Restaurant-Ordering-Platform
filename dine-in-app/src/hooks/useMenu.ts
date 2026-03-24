import { useEffect, useState } from 'react';
import { getCategories, getMenuItems } from '@/api/menuApi';
import type { Category, MenuItem } from '@/types';

interface UseMenuResult {
  categories: Category[];
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  getItemsByCategory: (categoryId: string) => MenuItem[];
}

export function useMenu(): UseMenuResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMenuData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const [fetchedCategories, fetchedItems] = await Promise.all([getCategories(), getMenuItems()]);

        if (!isMounted) {
          return;
        }

        setCategories(fetchedCategories);
        setItems(fetchedItems);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load menu data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchMenuData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    return items.filter((item) => item.categoryId === categoryId);
  };

  return {
    categories,
    items,
    loading,
    error,
    getItemsByCategory,
  };
}
