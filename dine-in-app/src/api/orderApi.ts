import { apiClient } from './client';
import type { Order, PaymentMethodType } from '@/types';

interface CreateOrderRequest {
  orderType: string;
  paymentMethod?: 'CashOnDelivery' | 'PayAtCounter';
  tableNumber?: string;
  customerName?: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  zip?: string;
  items: {
    menuItemId: string;
    quantity: number;
    selectedCustomizations: Record<string, string[]>;
    specialInstructions?: string;
  }[];
}

function buildCreateOrderRequest(
  order: Omit<Order, 'id' | 'createdAt' | 'status'>
): CreateOrderRequest {
  const details = order.orderTypeDetails;
  const request: CreateOrderRequest = {
    orderType: order.orderType,
    items: order.items.map((item) => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      selectedCustomizations: item.selectedCustomizations,
      specialInstructions: item.specialInstructions || undefined,
    })),
  };

  if (details.type === 'dine-in') {
    request.tableNumber = details.tableNumber;
  } else if (details.type === 'pickup') {
    request.customerName = details.customerName;
    request.phoneNumber = details.phoneNumber;
  } else if (details.type === 'delivery') {
    request.customerName = details.customerName;
    request.phoneNumber = details.phoneNumber;
    request.street = details.address.street;
    request.city = details.address.city;
    request.zip = details.address.zip;
  }

  if (order.paymentMethod === 'cashOnDelivery') {
    request.paymentMethod = 'CashOnDelivery';
  } else if (order.paymentMethod === 'payAtCounter') {
    request.paymentMethod = 'PayAtCounter';
  }

  return request;
}

function mapApiPaymentMethod(value: unknown): PaymentMethodType {
  if (value === 'CashOnDelivery') {
    return 'cashOnDelivery';
  }

  if (value === 'PayAtCounter') {
    return 'payAtCounter';
  }

  // Keep card as the default for legacy responses that do not include paymentMethod.
  return 'card';
}

function mapApiOrderToOrder(apiOrder: any): Order {
  return {
    id: apiOrder.id,
    orderType: apiOrder.orderType,
    paymentMethod: mapApiPaymentMethod(apiOrder.paymentMethod),
    orderTypeDetails: apiOrder.orderTypeDetails,
    items: (apiOrder.items || []).map((item: any) => ({
      id: item.id,
      menuItem: item.menuItem,
      quantity: item.quantity,
      selectedCustomizations: item.selectedCustomizations || {},
      specialInstructions: item.specialInstructions || '',
      itemTotal: item.itemTotal,
    })),
    subtotal: apiOrder.subtotal,
    tax: apiOrder.tax,
    total: apiOrder.total,
    status: apiOrder.status,
    createdAt: apiOrder.createdAt,
    paymentIntentId: apiOrder.paymentIntentId,
  };
}

export async function placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  const request = buildCreateOrderRequest(order);
  const apiOrder = await apiClient.post<any>('/orders', request);
  return mapApiOrderToOrder(apiOrder);
}

export async function getOrders(): Promise<Order[]> {
  const apiOrders = await apiClient.get<any[]>('/orders');
  return apiOrders.map(mapApiOrderToOrder);
}

export async function getOrderById(id: string): Promise<Order> {
  const apiOrder = await apiClient.get<any>(`/orders/${id}`);
  return mapApiOrderToOrder(apiOrder);
}