import { create } from 'zustand';
import { placeOrder as apiPlaceOrder, getOrders } from '@/api/orderApi';
import type { CartItem, Order, OrderType, OrderTypeDetails, PaymentMethodType } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  placeOrder: (
    orderType: OrderType,
    orderTypeDetails: OrderTypeDetails,
    paymentMethod: PaymentMethodType,
    items: CartItem[],
    subtotal: number,
    tax: number,
    total: number
  ) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  updateOrder: (updatedOrder: Order) => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  placeOrder: async (orderType, orderTypeDetails, paymentMethod, items, subtotal, tax, total) => {
    set({ loading: true });

    try {
      const order = await apiPlaceOrder({
        orderType,
        orderTypeDetails,
        paymentMethod,
        items,
        subtotal,
        tax,
        total,
      });

      set((state) => ({
        currentOrder: order,
        orders: [order, ...state.orders],
        loading: false,
      }));

      return order;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ loading: true });

    try {
      const orders = await getOrders();
      set({ orders, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  updateOrder: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      currentOrder: state.currentOrder?.id === updatedOrder.id ? updatedOrder : state.currentOrder,
    }));
  },
}));
