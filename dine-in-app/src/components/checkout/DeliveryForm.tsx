import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { DELIVERY_FEE } from '@/constants/config';

interface DeliveryFormProps {
  customerName: string;
  phoneNumber: string;
  street: string;
  city: string;
  zip: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeStreet: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeZip: (value: string) => void;
}

function getDigitCount(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function DeliveryForm({
  customerName,
  phoneNumber,
  street,
  city,
  zip,
  onChangeName,
  onChangePhone,
  onChangeStreet,
  onChangeCity,
  onChangeZip,
}: DeliveryFormProps) {
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [streetTouched, setStreetTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [zipTouched, setZipTouched] = useState(false);

  const isNameValid = customerName.trim().length > 0;
  const isPhoneValid = getDigitCount(phoneNumber) >= 10;
  const isStreetValid = street.trim().length > 0;
  const isCityValid = city.trim().length > 0;
  const isZipValid = zip.replace(/\D/g, '').length === 5;

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

      <Text style={styles.sectionTitle}>Delivery Address</Text>

      <Text style={styles.fieldLabel}>Street Address</Text>
      <TextInput
        value={street}
        onChangeText={onChangeStreet}
        onBlur={() => setStreetTouched(true)}
        placeholder="Enter street address"
        style={[styles.input, streetTouched && !isStreetValid ? styles.inputError : null]}
      />
      {streetTouched && !isStreetValid ? (
        <Text style={styles.errorText}>Street address is required.</Text>
      ) : null}

      <View style={styles.rowFields}>
        <View style={styles.fieldHalf}>
          <Text style={styles.fieldLabel}>City</Text>
          <TextInput
            value={city}
            onChangeText={onChangeCity}
            onBlur={() => setCityTouched(true)}
            placeholder="City"
            style={[styles.input, cityTouched && !isCityValid ? styles.inputError : null]}
          />
          {cityTouched && !isCityValid ? <Text style={styles.errorText}>City is required.</Text> : null}
        </View>

        <View style={styles.fieldHalf}>
          <Text style={styles.fieldLabel}>Zip Code</Text>
          <TextInput
            value={zip}
            onChangeText={onChangeZip}
            onBlur={() => setZipTouched(true)}
            placeholder="Zip code"
            keyboardType="number-pad"
            maxLength={5}
            style={[styles.input, zipTouched && !isZipValid ? styles.inputError : null]}
          />
          {zipTouched && !isZipValid ? (
            <Text style={styles.errorText}>Zip code must be 5 digits.</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.deliveryFeeNotice}>Delivery fee: {formatCurrency(DELIVERY_FEE)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
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
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  deliveryFeeNotice: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
