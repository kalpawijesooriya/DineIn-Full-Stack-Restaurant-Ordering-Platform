import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CartItem } from '@/types';
import { QuantityStepper } from '@/components/common/QuantityStepper';
import { Colors, Spacing, FontSize } from '@/constants/theme';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const customizationsObj = item.selectedCustomizations || {};
  const allCustomizationNames: string[] = [];
  
  Object.keys(customizationsObj).forEach(groupId => {
     const selectedIds = customizationsObj[groupId];
     if (!selectedIds) return;
     const group = item.menuItem.customizationGroups?.find(g => g.id === groupId);
     if (group) {
         selectedIds.forEach(optId => {
             const option = group.options?.find(o => o.id === optId);
             if (option) allCustomizationNames.push(option.name);
         });
     }
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.menuItem.name}</Text>
          {allCustomizationNames.length > 0 && (
            <Text style={styles.customizations}>
              {allCustomizationNames.join(', ')}
            </Text>
          )}
          {!!item.specialInstructions && (
            <Text style={styles.instructions}>
              Note: {item.specialInstructions}
            </Text>
          )}
          <Text style={styles.price}>${item.itemTotal.toFixed(2)}</Text>
        </View>
        <Pressable onPress={() => onRemove(item.id)} style={styles.removeButton}>
          <Text style={styles.removeText}>X</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={() => onUpdateQuantity(item.id, item.quantity + 1)}
          onDecrement={() => onUpdateQuantity(item.id, item.quantity - 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  customizations: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  instructions: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  removeText: {
    color: Colors.error,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
});
