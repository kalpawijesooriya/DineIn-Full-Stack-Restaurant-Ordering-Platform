import { api } from './client';
import type {
  Category,
  MenuItem,
  PaginatedResult,
  RestaurantSetting,
  DashboardData,
  RevenueReport,
  Order,
  CustomizationGroup,
  CustomizationOption,
  CustomizationGroupWithItem,
} from '@/types';

// Dashboard
export const getDashboard = () => api.get<DashboardData>('/admin/dashboard');

// Categories
export const getCategories = () => api.get<Category[]>('/admin/categories');
export const createCategory = (data: { name: string; imageUrl: string; sortOrder: number }) =>
  api.post<Category>('/admin/categories', data);
export const updateCategory = (id: string, data: { name: string; imageUrl: string; sortOrder: number }) =>
  api.put<Category>(`/admin/categories/${id}`, data);
export const deleteCategory = (id: string) => api.del<void>(`/admin/categories/${id}`);

// Menu Items
export const getMenuItems = (params?: { categoryId?: string; search?: string; page?: number; pageSize?: number }) => {
  const qs = new URLSearchParams();
  if (params?.categoryId) qs.set('categoryId', params.categoryId);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const q = qs.toString();
  return api.get<PaginatedResult<MenuItem>>(`/admin/menu-items${q ? `?${q}` : ''}`);
};
export const createMenuItem = (data: {
  name: string; description: string; price: number; imageUrl: string; categoryId: string; isAvailable: boolean;
}) => api.post<MenuItem>('/admin/menu-items', data);
export const updateMenuItem = (id: string, data: {
  name: string; description: string; price: number; imageUrl: string; categoryId: string; isAvailable: boolean;
}) => api.put<MenuItem>(`/admin/menu-items/${id}`, data);
export const toggleAvailability = (id: string, isAvailable: boolean) =>
  api.patch<{ id: string; isAvailable: boolean }>(`/admin/menu-items/${id}/availability`, { isAvailable });
export const deleteMenuItem = (id: string) => api.del<void>(`/admin/menu-items/${id}`);

// Settings
export const getSettings = () => api.get<RestaurantSetting[]>('/admin/settings');
export const updateSetting = (id: string, value: string) =>
  api.put<RestaurantSetting>(`/admin/settings/${id}`, { value });

// Orders
export const getOrders = (params?: { status?: string; type?: string; from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.type) qs.set('type', params.type);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const q = qs.toString();
  return api.get<Order[]>(`/admin/orders${q ? `?${q}` : ''}`);
};

// Revenue
export const getRevenueReport = (from?: string, to?: string) => {
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const q = qs.toString();
  return api.get<RevenueReport>(`/admin/reports/revenue${q ? `?${q}` : ''}`);
};

// Customization Groups
export const createCustomizationGroup = (menuItemId: string, data: { name: string; required: boolean; maxSelections: number }) =>
  api.post<CustomizationGroup>(`/admin/menu-items/${menuItemId}/customization-groups`, data);
export const updateCustomizationGroup = (id: string, data: { name: string; required: boolean; maxSelections: number }) =>
  api.put<CustomizationGroup>(`/admin/customization-groups/${id}`, data);
export const deleteCustomizationGroup = (id: string) =>
  api.del<void>(`/admin/customization-groups/${id}`);

// Customization Options
export const createCustomizationOption = (groupId: string, data: { name: string; priceAdjustment: number }) =>
  api.post<CustomizationOption>(`/admin/customization-groups/${groupId}/options`, data);
export const updateCustomizationOption = (id: string, data: { name: string; priceAdjustment: number }) =>
  api.put<CustomizationOption>(`/admin/customization-options/${id}`, data);
export const deleteCustomizationOption = (id: string) =>
  api.del<void>(`/admin/customization-options/${id}`);

// All Customization Groups (for clone/reuse)
export const getAllCustomizationGroups = () =>
  api.get<CustomizationGroupWithItem[]>('/admin/customization-groups');

export const cloneGroupToMenuItem = (groupId: string, menuItemId: string) =>
  api.post<CustomizationGroup>(`/admin/customization-groups/${groupId}/clone/${menuItemId}`, {});
