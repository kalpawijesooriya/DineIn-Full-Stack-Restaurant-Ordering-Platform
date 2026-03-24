import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface PickupFormProps {
  customerName: string;
  phoneNumber: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
}

function getDigitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function PickupForm({
  customerName,
  phoneNumber,
  onChangeName,
  onChangePhone,
}: PickupFormProps) {
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isNameValid = customerName.trim().length > 0;
  const isPhoneValid = getDigitCount(phoneNumber) >= 10;

  return (
    <View>
      <Text style={styles.fieldLabel}>Your Name</Text>
      <TextInput
        value={customerName}
        onChangeText={onChangeName}
        onBlur={() => setNameTouched(true)}
        placeholder="Enter your name"
        autoCapitalize="words"
        style={[styles.input, nameTouched && !isNameValid ? styles.inputError : null]}
      />
      {nameTouched && !isNameValid ? <Text style={styles.errorText}>Name is required.</Text> : null}

      <Text style={styles.fieldLabel}>Phone Number</Text>
      <TextInput
        value={phoneNumber}
        onChangeText={onChangePhone}
        onBlur={() => setPhoneTouched(true)}
        placeholder="(555) 123-4567"
        keyboardType="phone-pad"
        style={[styles.input, phoneTouched && !isPhoneValid ? styles.inputError : null]}
      />
      {phoneTouched && !isPhoneValid ? (
        <Text style={styles.errorText}>Enter a valid phone number with at least 10 digits.</Text>
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
