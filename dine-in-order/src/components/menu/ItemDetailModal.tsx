import { useEffect, useMemo, useState } from 'react';
import { getMenuItemById } from '@/api/menuApi';
import { CustomizationGroup } from '@/components/menu/CustomizationGroup';
import { Button, Modal, QuantitySelector, Skeleton } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { useCartStore } from '@/store/cartStore';
import type { MenuItem } from '@/types';

interface ItemDetailModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function getCustomizationAdjustments(item: MenuItem, selected: Record<string, string[]>): number {
  return Object.entries(selected).reduce((groupAcc, [groupId, optionIds]) => {
    const group = item.customizationGroups.find((customizationGroup) => customizationGroup.id === groupId);
    if (!group) {
      return groupAcc;
    }

    const optionTotal = optionIds.reduce((optionAcc, optionId) => {
      const option = group.options.find((customizationOption) => customizationOption.id === optionId);
      return optionAcc + (option?.priceAdjustment ?? 0);
    }, 0);

    return groupAcc + optionTotal;
  }, 0);
}

export function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    setSelectedCustomizations({});
    setSpecialInstructions('');
    setQuantity(1);
    setAttemptedSubmit(false);
    setError(null);
    setItem(null);
  }, [itemId]);

  useEffect(() => {
    if (!isOpen || !itemId) {
      return;
    }

    let ignore = false;

    const loadItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedItem = await getMenuItemById(itemId);
        if (!ignore) {
          setItem(fetchedItem);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load menu item');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadItem();

    return () => {
      ignore = true;
    };
  }, [isOpen, itemId]);

  const missingRequiredGroupIds = useMemo(() => {
    if (!item) {
      return new Set<string>();
    }

    return new Set(
      item.customizationGroups
        .filter((group) => group.required && !(selectedCustomizations[group.id]?.length > 0))
        .map((group) => group.id)
    );
  }, [item, selectedCustomizations]);

  const computedTotal = useMemo(() => {
    if (!item) {
      return 0;
    }

    const adjustments = getCustomizationAdjustments(item, selectedCustomizations);
    return (item.price + adjustments) * quantity;
  }, [item, quantity, selectedCustomizations]);

  const handleSelectionChange = (groupId: string, optionId: string, selected: boolean) => {
    if (!item) {
      return;
    }

    const group = item.customizationGroups.find((customizationGroup) => customizationGroup.id === groupId);
    if (!group) {
      return;
    }

    setSelectedCustomizations((previous) => {
      const currentSelection = previous[groupId] ?? [];

      if (group.maxSelections === 1) {
        return {
          ...previous,
          [groupId]: selected ? [optionId] : [],
        };
      }

      if (selected) {
        if (currentSelection.includes(optionId)) {
          return previous;
        }

        if (group.maxSelections > 0 && currentSelection.length >= group.maxSelections) {
          return previous;
        }

        return {
          ...previous,
          [groupId]: [...currentSelection, optionId],
        };
      }

      return {
        ...previous,
        [groupId]: currentSelection.filter((currentOptionId) => currentOptionId !== optionId),
      };
    });
  };

  const handleAddToCart = () => {
    if (!item) {
      return;
    }

    setAttemptedSubmit(true);

    if (missingRequiredGroupIds.size > 0 || !item.isAvailable) {
      return;
    }

    addItem(item, quantity, selectedCustomizations, specialInstructions.trim());
    showToast(`${item.name} added to cart`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item?.name ?? 'Item details'}
      maxWidth="max-w-2xl"
      bodyClassName="max-h-[80vh] overflow-y-auto p-0"
    >
      {loading ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton width="50%" />
          <Skeleton width="70%" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="space-y-4 p-5">
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : null}

      {!loading && !error && item ? (
        <div className="flex flex-col">
          <div className="space-y-5 p-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="aspect-video max-h-72 w-full object-cover" />
              ) : (
                <div className="aspect-video max-h-72 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" aria-hidden="true" />
              )}
            </div>

            <header>
              <h3 className="text-2xl font-bold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-4 text-xl font-bold text-primary">{formatCurrency(item.price)}</p>
              {!item.isAvailable ? (
                <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                  This item is currently unavailable.
                </p>
              ) : null}
            </header>

            {item.customizationGroups.length > 0 ? (
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-900">Customize your order</h4>
                {item.customizationGroups.map((group) => (
                  <CustomizationGroup
                    key={group.id}
                    group={group}
                    selectedOptions={selectedCustomizations[group.id] ?? []}
                    onSelectionChange={(optionId, selected) => handleSelectionChange(group.id, optionId, selected)}
                    showError={attemptedSubmit && missingRequiredGroupIds.has(group.id)}
                  />
                ))}
              </section>
            ) : null}

            <section>
              <label htmlFor="special-instructions" className="mb-1.5 block text-sm font-medium text-slate-700">
                Special instructions (optional)
              </label>
              <textarea
                id="special-instructions"
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value.slice(0, 200))}
                rows={4}
                maxLength={200}
                placeholder="Any allergies or preferences?"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-right text-xs text-slate-500">{specialInstructions.length}/200</p>
            </section>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <QuantitySelector value={quantity} min={1} onChange={setQuantity} />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="truncate text-lg font-bold text-slate-900">{formatCurrency(computedTotal)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!item.isAvailable || missingRequiredGroupIds.size > 0}
                className="min-w-36"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export type { ItemDetailModalProps };