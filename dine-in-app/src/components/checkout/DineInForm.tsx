import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface DineInFormProps {
  tableNumber: string;
  onChangeTableNumber: (value: string) => void;
}

export function DineInForm({ tableNumber, onChangeTableNumber }: DineInFormProps) {
  const [tableTouched, setTableTouched] = useState(false);
  const isTableValid = tableNumber.trim().length > 0;

  return (
    <View>
      <Text style={styles.fieldLabel}>Table Number</Text>
      <TextInput
        value={tableNumber}
        onChangeText={onChangeTableNumber}
        onBlur={() => setTableTouched(true)}
        placeholder="Enter table number"
        keyboardType="number-pad"
        style={[styles.input, tableTouched && !isTableValid ? styles.inputError : null]}
      />
      {tableTouched && !isTableValid ? (
        <Text style={styles.errorText}>Table number is required.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    marginBottom: Spacing.xs,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
});
