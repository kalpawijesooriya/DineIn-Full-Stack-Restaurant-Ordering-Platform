import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/common/Button';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { router } from 'expo-router';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());
  const deliveryFee = useCartStore((state) => state.getDeliveryFee());

  const hasItems = items.length > 0;

  if (!hasItems) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={72} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add something delicious from the menu.</Text>
        <Button title="Browse Menu" onPress={() => router.push('/(tabs)')} style={styles.emptyButton} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onUpdateQuantity={(id, newQuantity) => updateQuantity(id, newQuantity)}
            onRemove={(id) => removeItem(id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <CartSummary
        subtotal={subtotal}
        tax={tax}
        total={total}
        deliveryFee={deliveryFee}
        onCheckout={() => router.push('/checkout')}
        disabled={!hasItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
});
