import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getOrderById } from '@/api/orderApi';
import { OrderProgressStepper } from '@/components/order/OrderProgressStepper';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/config';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { useOrderStore } from '@/store/orderStore';
import type { Order, OrderType } from '@/types';

const orderTypeConfig: Record<OrderType, { iconName: keyof typeof Ionicons.glyphMap; label: string }> = {
  'dine-in': { iconName: 'restaurant-outline', label: 'Dine-in' },
  pickup: { iconName: 'bag-handle-outline', label: 'Pickup' },
  delivery: { iconName: 'car-outline', label: 'Delivery' },
};

const formatOrderId = (id: string): string => `#${id.slice(-6).toUpperCase()}`;

function getPaymentMessage(paymentMethod: string): string {
  if (paymentMethod === 'cashOnDelivery') {
    return '💵 Pay cash when your order arrives';
  }

  if (paymentMethod === 'payAtCounter') {
    return '💳 Please pay at the counter';
  }

  return '✅ Paid by card';
}

const getStatusMessage = (status: string, orderType: OrderType): string => {
  if (status === 'confirmed') {
    return 'Your order has been received!';
  }

  if (status === 'preparing') {
    return 'Your order is being prepared...';
  }

  if (status === 'ready') {
    if (orderType === 'delivery') {
      return 'Out for delivery!';
    }

    if (orderType === 'pickup') {
      return 'Ready for pickup!';
    }

    return 'Your order is ready!';
  }

  if (status === 'completed') {
    return 'Order completed. Enjoy!';
  }

  return 'We are processing your order...';
};

const getEstimatedTime = (orderType: OrderType, orderTypeDetails: any): string | null => {
  if (orderType === 'delivery') {
    return `Estimated delivery: ${orderTypeDetails.estimatedDeliveryTime}`;
  }

  if (orderType === 'pickup') {
    return `Estimated ready time: ${orderTypeDetails.estimatedPickupTime}`;
  }

  if (orderType === 'dine-in') {
    return 'Estimated ready time: 15-20 minutes';
  }

  return null;
};

export default function OrderTrackerScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { orders, currentOrder, updateOrder } = useOrderStore();
  const [hasFetched, setHasFetched] = useState(false);

  const order = useMemo(() => {
    if (!orderId) {
      return null;
    }

    if (currentOrder?.id === orderId) {
      return currentOrder;
    }

    return orders.find((candidate) => candidate.id === orderId) ?? null;
  }, [currentOrder, orderId, orders]);

  useEffect(() => {
    if (!orderId || order?.status === 'completed') {
      return;
    }

    let active = true;

    // Initial fetch
    const fetchInitial = async () => {
      try {
        const latestOrder = await getOrderById(orderId);
        if (active) {
          updateOrder(latestOrder);
        }
      } catch {
        // Silent — SignalR will keep us updated
      } finally {
        if (active) {
          setHasFetched(true);
        }
      }
    };

    void fetchInitial();

    // SignalR connection for real-time updates
    const hubUrl = API_BASE_URL.replace(/\/api$/, '') + '/hubs/orders';
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('OrderUpdated', (updatedOrder: Order) => {
      if (active && updatedOrder.id === orderId) {
        updateOrder(updatedOrder);
      }
    });

    connection.start().catch(() => {});

    return () => {
      active = false;
      connection.stop();
    };
  }, [order?.status, orderId, updateOrder]);

  if (!order && !hasFetched) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.emptyText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.error} />
        <Text style={styles.emptyTitle}>Order not found</Text>
        <Text style={styles.emptyText}>We could not find this order to track.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 16 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orderType = order.orderTypeDetails.type;
  const { iconName, label } = orderTypeConfig[orderType];
  const statusMessage = getStatusMessage(order.status, orderType);
  const estimatedTime = order.status !== 'completed' ? getEstimatedTime(orderType, order.orderTypeDetails) : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Order {formatOrderId(order.id)}</Text>
        <View style={styles.orderTypeBadge}>
          <Ionicons name={iconName} size={16} color={Colors.primary} />
          <Text style={styles.orderTypeText}>{label}</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <OrderProgressStepper currentStatus={order.status} />
      </View>

      <View style={styles.messageCard}>
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.paymentText}>{getPaymentMessage(order.paymentMethod)}</Text>
      </View>

      {estimatedTime && (
        <View style={styles.estimateCard}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.estimateText}>{estimatedTime}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.lineItem}>
            <Text style={styles.lineItemName}>
              {item.menuItem.name} x {item.quantity}
            </Text>
            <Text style={styles.lineItemPrice}>{formatCurrency(item.itemTotal)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.subtotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.tax)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Type Details</Text>

        {order.orderTypeDetails.type === 'dine-in' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Table</Text>
            <Text style={styles.detailValue}>#{order.orderTypeDetails.tableNumber}</Text>
          </View>
        )}

        {order.orderTypeDetails.type === 'pickup' && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.customerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Pickup</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.estimatedPickupTime}</Text>
            </View>
          </>
        )}

        {order.orderTypeDetails.type === 'delivery' && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.customerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {order.orderTypeDetails.address.street}, {order.orderTypeDetails.address.city}{' '}
                {order.orderTypeDetails.address.zip}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Delivery</Text>
              <Text style={styles.detailValue}>{order.orderTypeDetails.estimatedDeliveryTime}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  orderTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orderTypeText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusMessage: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  estimateCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  estimateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineItemName: {
    flex: 1,
    marginRight: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  lineItemPrice: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  totalRow: {
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  detailLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});