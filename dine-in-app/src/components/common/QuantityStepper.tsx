import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}) => {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={isMin}
        style={({ pressed }) => [
          styles.button,
          isMin && styles.buttonDisabled,
          pressed && !isMin && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      
      <Text style={styles.quantityText}>{quantity}</Text>
      
      <Pressable
        onPress={onIncrement}
        disabled={isMax}
        style={({ pressed }) => [
          styles.button,
          isMax && styles.buttonDisabled,
          pressed && !isMax && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  quantityText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 40,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
});
