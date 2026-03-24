import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { OrderTypeSelector } from '@/components/checkout/OrderTypeSelector';
import { DineInForm } from '@/components/checkout/DineInForm';
import { PickupForm } from '@/components/checkout/PickupForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { Button } from '@/components/common/Button';
import { DELIVERY_FEE } from '@/constants/config';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import type { OrderType, OrderTypeDetails, PaymentMethodType } from '@/types';

type PaymentOption = {
  method: PaymentMethodType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const paymentOptionMap: Record<PaymentMethodType, PaymentOption> = {
  card: {
    method: 'card',
    title: 'Pay by Card',
    subtitle: 'Pay now with card details',
    icon: 'card-outline',
  },
  cashOnDelivery: {
    method: 'cashOnDelivery',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash when your order arrives',
    icon: 'cash-outline',
  },
  payAtCounter: {
    method: 'payAtCounter',
    title: 'Pay at Counter',
    subtitle: 'Complete payment at the counter',
    icon: 'storefront-outline',
  },
};

const CARD_DIGIT_LENGTH = 16;
const CVC_LENGTH = 3;

function formatCardNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, CARD_DIGIT_LENGTH);
  return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
}

function isExpiryValid(expiry: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }

  const [monthStr, yearStr] = expiry.split('/');
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

export default function CheckoutScreen() {
  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const setOrderType = useCartStore((state) => state.setOrderType);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());

  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedTableNumber = tableNumber.trim();
  const trimmedCustomerName = customerName.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const trimmedStreet = street.trim();
  const trimmedCity = city.trim();
  const trimmedZip = zip.trim();

  const cardDigits = cardNumber.replace(/\s/g, '');
  const phoneDigits = phoneNumber.replace(/\D/g, '');
  const zipDigits = zip.replace(/\D/g, '');

  const isTableValid = trimmedTableNumber.length > 0;
  const isCustomerNameValid = trimmedCustomerName.length > 0;
  const isPhoneValid = phoneDigits.length >= 10;
  const isStreetValid = trimmedStreet.length > 0;
  const isCityValid = trimmedCity.length > 0;
  const isZipValid = zipDigits.length === 5;

  const isCardValid = cardDigits.length === CARD_DIGIT_LENGTH;
  const isExpiryFieldValid = isExpiryValid(expiry);
  const isCvcValid = /^\d{3}$/.test(cvc);
  const isCardPayment = paymentMethod === 'card';

  const availablePaymentOptions = useMemo(() => {
    if (orderType === 'delivery') {
      return [paymentOptionMap.card, paymentOptionMap.cashOnDelivery];
    }

    return [paymentOptionMap.card, paymentOptionMap.payAtCounter];
  }, [orderType]);

  useEffect(() => {
    const allowedMethods = availablePaymentOptions.map((option) => option.method);
    if (!allowedMethods.includes(paymentMethod)) {
      setPaymentMethod(allowedMethods[0]);
    }
  }, [availablePaymentOptions, paymentMethod]);

  const isOrderTypeFormValid = useMemo(() => {
    switch (orderType) {
      case 'dine-in':
        return isTableValid;
      case 'pickup':
        return isCustomerNameValid && isPhoneValid;
      case 'delivery':
        return isCustomerNameValid && isPhoneValid && isStreetValid && isCityValid && isZipValid;
      default:
        return false;
    }
  }, [
    orderType,
    isTableValid,
    isCustomerNameValid,
    isPhoneValid,
    isStreetValid,
    isCityValid,
    isZipValid,
  ]);

  const canSubmit = useMemo(() => {
    const paymentValid = isCardPayment ? isCardValid && isExpiryFieldValid && isCvcValid : true;

    return (
      isOrderTypeFormValid &&
      paymentValid &&
      items.length > 0 &&
      !loading
    );
  }, [isOrderTypeFormValid, isCardPayment, isCardValid, isExpiryFieldValid, isCvcValid, items.length, loading]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setLoading(true);

    try {
      const cartState = useCartStore.getState();
      const cartItems = cartState.items;

      if (cartItems.length === 0) {
        setLoading(false);
        return;
      }

      let orderTypeDetails: OrderTypeDetails;

      if (orderType === 'dine-in') {
        orderTypeDetails = {
          type: 'dine-in',
          tableNumber: trimmedTableNumber,
        };
      } else if (orderType === 'pickup') {
        orderTypeDetails = {
          type: 'pickup',
          customerName: trimmedCustomerName,
          phoneNumber: trimmedPhoneNumber,
          estimatedPickupTime: '',
        };
      } else {
        orderTypeDetails = {
          type: 'delivery',
          customerName: trimmedCustomerName,
          phoneNumber: trimmedPhoneNumber,
          address: {
            street: trimmedStreet,
            city: trimmedCity,
            zip: trimmedZip,
          },
          deliveryFee: DELIVERY_FEE,
          estimatedDeliveryTime: '',
        };
      }

      const order = await useOrderStore
        .getState()
        .placeOrder(
          orderType as OrderType,
          orderTypeDetails,
          paymentMethod,
          cartItems,
          cartState.getSubtotal(),
          cartState.getTax(),
          cartState.getTotal()
        );

      useCartStore.getState().clearCart();
      router.replace(`/confirmation/${order.id}`);
    } catch (error) {
      console.error('Failed to place order', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <OrderTypeSelector selectedType={orderType} onSelect={setOrderType} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          {orderType === 'dine-in' ? (
            <DineInForm tableNumber={tableNumber} onChangeTableNumber={setTableNumber} />
          ) : null}

          {orderType === 'pickup' ? (
            <PickupForm
              customerName={customerName}
              phoneNumber={phoneNumber}
              onChangeName={setCustomerName}
              onChangePhone={setPhoneNumber}
            />
          ) : null}

          {orderType === 'delivery' ? (
            <DeliveryForm
              customerName={customerName}
              phoneNumber={phoneNumber}
              street={street}
              city={city}
              zip={zip}
              onChangeName={setCustomerName}
              onChangePhone={setPhoneNumber}
              onChangeStreet={setStreet}
              onChangeCity={setCity}
              onChangeZip={setZip}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View style={styles.summaryRow} key={item.id}>
              <Text style={styles.summaryItemName}>
                {item.menuItem.name} x{item.quantity}
              </Text>
              <Text style={styles.summaryItemValue}>{formatCurrency(item.itemTotal)}</Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>
          {orderType === 'delivery' ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(DELIVERY_FEE)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentSelectorRow}>
            {availablePaymentOptions.map((option) => {
              const selected = paymentMethod === option.method;

              return (
                <TouchableOpacity
                  key={option.method}
                  onPress={() => setPaymentMethod(option.method)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={option.title}
                  style={[styles.paymentOptionButton, selected ? styles.paymentOptionSelected : null]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.paymentOptionTitle, selected ? styles.paymentOptionTitleSelected : null]}>
                    {option.title}
                  </Text>
                  <Text style={styles.paymentOptionSubtitle}>{option.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isCardPayment ? (
            <>
              <Text style={styles.helperText}>Simulated payment form. No real card data is processed.</Text>

              <Text style={styles.fieldLabel}>Card Number</Text>
              <TextInput
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                placeholder="4242 4242 4242 4242"
                keyboardType="number-pad"
                maxLength={19}
                style={[styles.input, !isCardValid && cardNumber.length > 0 ? styles.inputError : null]}
              />
              {!isCardValid && cardNumber.length > 0 ? (
                <Text style={styles.errorText}>Card number must contain 16 digits.</Text>
              ) : null}

              <View style={styles.rowFields}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Expiry</Text>
                  <TextInput
                    value={expiry}
                    onChangeText={(value) => setExpiry(formatExpiry(value))}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    maxLength={5}
                    style={[
                      styles.input,
                      !isExpiryFieldValid && expiry.length > 0 ? styles.inputError : null,
                    ]}
                  />
                  {!isExpiryFieldValid && expiry.length > 0 ? (
                    <Text style={styles.errorText}>Enter a valid, non-expired date.</Text>
                  ) : null}
                </View>

                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>CVC</Text>
                  <TextInput
                    value={cvc}
                    onChangeText={(value) => setCvc(value.replace(/\D/g, '').slice(0, CVC_LENGTH))}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    style={[styles.input, !isCvcValid && cvc.length > 0 ? styles.inputError : null]}
                  />
                  {!isCvcValid && cvc.length > 0 ? (
                    <Text style={styles.errorText}>CVC must be 3 digits.</Text>
                  ) : null}
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.helperText}>No card details required for this payment method.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isCardPayment ? `Pay ${formatCurrency(total)}` : 'Place Order'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
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
  helperText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  paymentSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  paymentOptionButton: {
    flex: 1,
    minHeight: 108,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FDEDEE',
  },
  paymentOptionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentOptionTitleSelected: {
    color: Colors.primary,
  },
  paymentOptionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  summaryItemName: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  summaryItemValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  summaryTotalLabel: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
