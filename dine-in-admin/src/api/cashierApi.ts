import { api } from './client';
import type { CashierMenuResponse, MenuItem, Order, CashierPlaceOrderRequest } from '@/types';

export const getCashierMenu = () =>
  api.get<CashierMenuResponse>('/cashier/menu');

export const placeCashierOrder = (data: CashierPlaceOrderRequest) =>
  api.post<Order>('/cashier/orders', data);

export const getCashierOrders = (status?: string) => {
  const qs = status ? `?status=${status}` : '';
  return api.get<Order[]>(`/cashier/orders${qs}`);
};

export const completeOrder = (id: string) =>
  api.patch<Order>(`/cashier/orders/${id}/complete`, {});

export const processCashierPayment = (
  orderId: string,
  data: { paymentMethod: 'cash' | 'card'; amountTendered?: number },
) => api.patch<Order>(`/cashier/orders/${orderId}/payment`, data);

export const getCashierMenuItems = () =>
  api.get<MenuItem[]>('/cashier/menu-items');

export const toggleCashierAvailability = (id: string, isAvailable: boolean) =>
  api.patch<{ id: string; isAvailable: boolean }>(`/cashier/menu-items/${id}/availability`, { isAvailable });
