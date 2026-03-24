export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
export type OrderType = 'dine-in' | 'pickup' | 'delivery';

export interface CustomizationOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  customizationGroups: CustomizationGroup[];
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: Record<string, string[]>;
  specialInstructions: string;
  itemTotal: number;
}

export interface DineInDetails {
  type: 'dine-in';
  tableNumber: string;
}

export interface PickupDetails {
  type: 'pickup';
  customerName: string;
  phoneNumber: string;
  estimatedPickupTime: string;
}

export interface DeliveryDetails {
  type: 'delivery';
  customerName: string;
  phoneNumber: string;
  address: { street: string; city: string; zip: string };
  deliveryFee: number;
  estimatedDeliveryTime: string;
}

export type OrderTypeDetails = DineInDetails | PickupDetails | DeliveryDetails;

export interface Order {
  id: string;
  orderType: OrderType;
  orderTypeDetails: OrderTypeDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentIntentId?: string;
}
