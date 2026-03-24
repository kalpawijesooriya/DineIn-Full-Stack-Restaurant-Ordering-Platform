import { apiClient } from './client';
import type { Order } from '@/types';

export async function getKitchenOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/orders');
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return apiClient.put<Order>(`/orders/${orderId}/status`, { status });
}
