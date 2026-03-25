import { apiClient } from './client';
import type { Category, MenuItem } from '@/types';

export async function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>('/categories');
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  return apiClient.get<MenuItem[]>(`/menu-items${query}`);
}

export async function getMenuItemById(id: string): Promise<MenuItem> {
  return apiClient.get<MenuItem>(`/menu-items/${id}`);
}
