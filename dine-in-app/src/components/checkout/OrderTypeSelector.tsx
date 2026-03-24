import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { OrderType } from '@/types';

interface OrderTypeSelectorProps {
  selectedType: OrderType;
  onSelect: (type: OrderType) => void;
}

const orderTypeOptions: Array<{
  type: OrderType;
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { type: 'dine-in', label: 'Dine-in', iconName: 'restaurant-outline' },
  { type: 'pickup', label: 'Pickup', iconName: 'bag-handle-outline' },
  { type: 'delivery', label: 'Delivery', iconName: 'car-outline' },
];

export function OrderTypeSelector({ selectedType, onSelect }: OrderTypeSelectorProps) {
  return (
    <View style={styles.row}>
      {orderTypeOptions.map((option) => {
        const isSelected = selectedType === option.type;

        return (
          <Pressable
            key={option.type}
            onPress={() => onSelect(option.type)}
            style={[styles.card, isSelected ? styles.cardSelected : styles.cardUnselected]}
          >
            <Ionicons
              name={option.iconName}
              size={22}
              color={isSelected ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.label, isSelected ? styles.labelSelected : styles.labelUnselected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 86,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}14`,
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  label: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  labelSelected: {
    color: Colors.primary,
  },
  labelUnselected: {
    color: Colors.textSecondary,
  },
});
