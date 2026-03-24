import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { useOrderStore } from '@/store/orderStore';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import type { OrderStatus, OrderType } from '@/types';

const statusColors: Record<OrderStatus, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  preparing: Colors.warning,
  ready: Colors.primary,
  completed: Colors.textSecondary,
};

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

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { orders, currentOrder } = useOrderStore();

  const order = useMemo(() => {
    if (!orderId) {
      return null;
    }

    if (currentOrder?.id === orderId) {
      return currentOrder;
    }

    return orders.find((candidate) => candidate.id === orderId) ?? null;
  }, [currentOrder, orderId, orders]);

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.error} />
        <Text style={styles.errorTitle}>Order not found</Text>
        <Text style={styles.errorText}>We could not find this order confirmation.</Text>
        <Button title="Back to Menu" onPress={() => router.replace('/(tabs)')} style={styles.errorButton} />
      </View>
    );
  }

  const orderType = order.orderTypeDetails.type;
  const { iconName, label } = orderTypeConfig[orderType];

  let etaText = 'Estimated prep time: ~15-20 minutes';
  if (order.orderTypeDetails.type === 'pickup') {
    etaText = `Ready for pickup at ${order.orderTypeDetails.estimatedPickupTime}`;
  }
  if (order.orderTypeDetails.type === 'delivery') {
    etaText = `Estimated delivery by ${order.orderTypeDetails.estimatedDeliveryTime}`;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.orderId}>Order {formatOrderId(order.id)}</Text>
        <View style={styles.orderTypeBadge}>
          <Ionicons name={iconName} size={16} color={Colors.primary} />
          <Text style={styles.orderTypeText}>{label}</Text>
        </View>
      </View>

      {order.orderTypeDetails.type === 'dine-in' && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Table</Text>
          <Text style={styles.metaValue}>#{order.orderTypeDetails.tableNumber}</Text>
        </View>
      )}

      {order.orderTypeDetails.type === 'pickup' && (
        <>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Pickup for</Text>
            <Text style={styles.metaValue}>{order.orderTypeDetails.customerName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phone</Text>
            <Text style={styles.metaValue}>{order.orderTypeDetails.phoneNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Est. Pickup</Text>
            <Text style={styles.metaValue}>{order.orderTypeDetails.estimatedPickupTime}</Text>
          </View>
        </>
      )}

      {order.orderTypeDetails.type === 'delivery' && (
        <>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Deliver to</Text>
            <Text style={styles.metaValue}>
              {order.orderTypeDetails.address.street}, {order.orderTypeDetails.address.city}{' '}
              {order.orderTypeDetails.address.zip}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phone</Text>
            <Text style={styles.metaValue}>{order.orderTypeDetails.phoneNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Est. Delivery</Text>
            <Text style={styles.metaValue}>{order.orderTypeDetails.estimatedDeliveryTime}</Text>
          </View>
        </>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.paymentText}>{getPaymentMessage(order.paymentMethod)}</Text>
      </View>

      <View style={styles.divider} />

      <View>
        {order.items.map((item) => (
          <View key={item.id} style={styles.lineItem}>
            <Text style={styles.lineItemName}>
              {item.menuItem.name} x {item.quantity}
            </Text>
            <Text style={styles.lineItemPrice}>{formatCurrency(item.itemTotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.subtotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.tax)}</Text>
        </View>
        {order.orderTypeDetails.type === 'delivery' && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>{formatCurrency(order.orderTypeDetails.deliveryFee)}</Text>
          </View>
        )}
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      <View style={styles.etaCard}>
        <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.etaText}>{etaText}</Text>
      </View>

      {order.status !== 'completed' && (
        <Button
          title="Track Order"
          onPress={() => router.push(`/tracker/${order.id}`)}
          variant="outline"
          style={styles.trackButton}
        />
      )}

      <Button title="Back to Menu" onPress={() => router.replace('/(tabs)')} style={styles.backButton} />
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
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  orderId: {
    marginTop: Spacing.xs,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  orderTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  orderTypeText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: Colors.textLight,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  paymentCard: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  lineItemName: {
    flex: 1,
    marginRight: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  lineItemPrice: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  priceSection: {
    gap: Spacing.sm,
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
    fontWeight: '500',
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
  etaCard: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  etaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  trackButton: {
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    marginTop: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  errorText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: Spacing.lg,
    minWidth: 180,
  },
});
