import { create } from 'zustand';
import { TAX_RATE, DELIVERY_FEE } from '@/constants/config';
import type { CartItem, MenuItem, OrderType } from '@/types';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  addItem: (
    menuItem: MenuItem,
    quantity: number,
    selectedCustomizations: Record<string, string[]>,
    specialInstructions: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  setOrderType: (type: OrderType) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const generateCartItemId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const calculateCustomizationAdjustments = (
  menuItem: MenuItem,
  selectedCustomizations: Record<string, string[]>
): number => {
  return Object.entries(selectedCustomizations).reduce((groupAcc, [groupId, optionIds]) => {
    const group = menuItem.customizationGroups.find((customizationGroup) => customizationGroup.id === groupId);
    if (!group) {
      return groupAcc;
    }

    const optionAdjustment = optionIds.reduce((optionAcc, optionId) => {
      const option = group.options.find((customizationOption) => customizationOption.id === optionId);
      return optionAcc + (option?.priceAdjustment ?? 0);
    }, 0);

    return groupAcc + optionAdjustment;
  }, 0);
};

const calculateItemTotal = (
  menuItem: MenuItem,
  quantity: number,
  selectedCustomizations: Record<string, string[]>
): number => {
  const adjustments = calculateCustomizationAdjustments(menuItem, selectedCustomizations);
  return (menuItem.price + adjustments) * quantity;
};

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  orderType: 'dine-in',

  addItem: (menuItem, quantity, selectedCustomizations, specialInstructions) => {
    const itemTotal = calculateItemTotal(menuItem, quantity, selectedCustomizations);

    const newCartItem: CartItem = {
      id: generateCartItemId(),
      menuItem,
      quantity,
      selectedCustomizations,
      specialInstructions,
      itemTotal,
    };

    set((state) => ({ items: [...state.items, newCartItem] }));
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter((item) => item.id !== cartItemId),
      }));
      return;
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== cartItemId) {
          return item;
        }

        return {
          ...item,
          quantity,
          itemTotal: calculateItemTotal(item.menuItem, quantity, item.selectedCustomizations),
        };
      }),
    }));
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  clearCart: () => {
    set({ items: [], orderType: 'dine-in' });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.itemTotal, 0);
  },

  getTax: () => {
    return get().getSubtotal() * TAX_RATE;
  },

  getDeliveryFee: () => {
    return get().orderType === 'delivery' ? DELIVERY_FEE : 0;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTax() + get().getDeliveryFee();
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
