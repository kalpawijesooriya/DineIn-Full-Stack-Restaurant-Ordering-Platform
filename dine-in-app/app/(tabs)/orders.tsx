import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '@/store/orderStore';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import type { Order, OrderStatus, OrderType } from '@/types';

const statusColors: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  preparing: Colors.warning,
  ready: Colors.primary,
  completed: Colors.textSecondary,
};

const orderTypeConfig: Record<OrderType, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  'dine-in': { icon: 'restaurant-outline', label: 'Dine-in' },
  pickup: { icon: 'bag-handle-outline', label: 'Pickup' },
  delivery: { icon: 'car-outline', label: 'Delivery' },
};

const formatOrderId = (id: string): string => `#${id.slice(-6).toUpperCase()}`;

const formatCreatedAt = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getPaymentBadgeLabel = (paymentMethod: Order['paymentMethod']): string => {
  if (paymentMethod === 'cashOnDelivery') {
    return 'Cash on Delivery';
  }

  if (paymentMethod === 'payAtCounter') {
    return 'Pay at Counter';
  }

  return 'Card';
};

export default function OrdersHistoryScreen() {
  const { orders, fetchOrders, setCurrentOrder } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } catch {
      // Keep this silent for now to avoid blocking the list UI.
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [orders]
  );

  const handleOrderPress = useCallback(
    (order: Order) => {
      setCurrentOrder(order);
      const activeStatuses = ['confirmed', 'preparing', 'ready'];
      if (activeStatuses.includes(order.status)) {
        router.navigate({ pathname: '/tracker/[id]', params: { id: order.id } } as any);
      } else {
        router.navigate({ pathname: '/confirmation/[id]', params: { id: order.id } } as any);
      }
    },
    [setCurrentOrder]
  );

  const renderOrderCard: ListRenderItem<Order> = ({ item }) => {
    const itemCount = item.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    const resolvedOrderType = (item.orderType ?? 'dine-in') as OrderType;
    const { icon, label } = orderTypeConfig[resolvedOrderType];

    let detail = '';
    if (item.orderTypeDetails.type === 'dine-in') {
      detail = `Table #${item.orderTypeDetails.tableNumber}`;
    }
    if (item.orderTypeDetails.type === 'pickup') {
      detail = item.orderTypeDetails.customerName;
    }
    if (item.orderTypeDetails.type === 'delivery') {
      detail = `${item.orderTypeDetails.address.street}, ${item.orderTypeDetails.address.city}`;
    }

    return (
      <Pressable
        onPress={() => handleOrderPress(item)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order {formatOrderId(item.id)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formatCreatedAt(item.createdAt)}</Text>

        <View style={styles.orderTypeRow}>
          <Ionicons name={icon} size={14} color={Colors.textSecondary} />
          <Text style={styles.orderTypeLabel}>{label}</Text>
          <Text style={styles.orderTypeDetail}>{detail}</Text>
        </View>

        <View style={styles.paymentBadge}>
          <Text style={styles.paymentBadgeText}>{getPaymentBadgeLabel(item.paymentMethod)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>{itemCount} items</Text>
          <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
        </View>
      </Pressable>
    );
  };

  if (sortedOrders.length === 0 && !refreshing) {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="receipt-outline" size={56} color={Colors.textSecondary} />
        <Text style={styles.emptyStateText}>No orders yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={loadOrders}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  orderId: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  statusText: {
    color: Colors.textLight,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  orderTypeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  orderTypeDetail: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginLeft: 'auto',
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FDEDEE',
    borderWidth: 1,
    borderColor: '#F8C8CC',
  },
  paymentBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  totalText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  emptyStateText: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
