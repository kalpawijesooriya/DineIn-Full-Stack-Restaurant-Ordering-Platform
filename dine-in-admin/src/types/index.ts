export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
  customizationGroups: CustomizationGroup[];
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface CustomizationGroupWithItem {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  menuItemId: string;
  menuItemName: string;
  options: CustomizationOption[];
}

export interface Order {
  id: string;
  orderType: string;
  status: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  amountTendered?: number;
  changeGiven?: number;
  cashierId?: string;
  tableNumber?: number;
  customerName?: string;
  phoneNumber?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  menuItemName: string;
  menuItemPrice: number;
  quantity: number;
  specialInstructions?: string;
  itemTotal: number;
}

export interface RestaurantSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface DashboardData {
  totalOrdersToday: number;
  revenueToday: number;
  activeOrders: number;
  completedOrdersToday: number;
  averageOrderValue: number;
  ordersByType: Record<string, number>;
  recentOrders: Order[];
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyBreakdown: DailyRevenue[];
  ordersByType: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CashierMenuResponse {
  categories: Category[];
  items: MenuItem[];
}

export interface CashierOrderItemRequest {
  menuItemId: string;
  quantity: number;
  selectedCustomizations?: Record<string, string[]>;
  specialInstructions?: string;
}

export interface CashierPlaceOrderRequest {
  orderType: string;
  tableNumber?: string;
  customerName?: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  zip?: string;
  paymentMethod: 'cash' | 'card' | 'none';
  amountTendered?: number;
  items: CashierOrderItemRequest[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: Record<string, string[]>;
  specialInstructions: string;
  lineTotal: number;
}
