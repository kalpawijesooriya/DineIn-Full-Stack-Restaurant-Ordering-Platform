import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartSummary } from '@/components/cart/CartSummary';
import { ContactForm } from '@/components/checkout/ContactForm';
import { DeliveryAddressForm } from '@/components/checkout/DeliveryAddressForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { DELIVERY_FEE } from '@/constants/config';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import type { CartItem, OrderTypeDetails, PaymentMethodType } from '@/types';

interface CheckoutErrors {
  customerName?: string;
  phoneNumber?: string;
  tableNumber?: string;
  street?: string;
  city?: string;
  zip?: string;
}

function getOrderTypeLabel(orderType: string): string {
  if (orderType === 'dine-in') {
    return 'Dine-In';
  }

  if (orderType === 'pickup') {
    return 'Pickup';
  }

  if (orderType === 'delivery') {
    return 'Delivery';
  }

  return 'Unknown';
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const items = useCartStore((state) => state.items);
  const orderType = useCartStore((state) => state.orderType);
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const cartTax = useCartStore((state) => state.getTax());
  const cartDeliveryFee = useCartStore((state) => state.getDeliveryFee());
  const cartTotal = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const storeTableNumber = useCartStore((state) => state.tableNumber ?? '');
  const setStoreTableNumber = useCartStore((state) => state.setTableNumber);

  const placeOrder = useOrderStore((state) => state.placeOrder);

  const [tableNumber, setTableNumber] = useState(storeTableNumber);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    orderType === 'delivery' ? 'cashOnDelivery' : 'payAtCounter'
  );
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu', { replace: true });
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (!orderType) {
      navigate('/', { replace: true });
    }
  }, [orderType, navigate]);

  useEffect(() => {
    if (orderType === 'delivery' && paymentMethod === 'payAtCounter') {
      setPaymentMethod('cashOnDelivery');
      return;
    }

    if (orderType !== 'delivery' && paymentMethod === 'cashOnDelivery') {
      setPaymentMethod('payAtCounter');
    }
  }, [orderType, paymentMethod]);

  const orderTypeLabel = useMemo(() => getOrderTypeLabel(orderType), [orderType]);

  const handlePlaceOrder = async () => {
    const nextErrors: CheckoutErrors = {};

    const trimmedTable = tableNumber.trim();
    const trimmedName = customerName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    const trimmedZip = zip.trim();

    if (!trimmedName) {
      nextErrors.customerName = 'Name is required';
    }

    if (!trimmedPhone) {
      nextErrors.phoneNumber = 'Phone number is required';
    }

    if (orderType === 'dine-in' && !trimmedTable) {
      nextErrors.tableNumber = 'Table number is required';
    }

    if (orderType === 'delivery') {
      if (!trimmedStreet) {
        nextErrors.street = 'Street is required';
      }

      if (!trimmedCity) {
        nextErrors.city = 'City is required';
      }

      if (!trimmedZip) {
        nextErrors.zip = 'ZIP code is required';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      let orderTypeDetails: OrderTypeDetails;

      if (orderType === 'dine-in') {
        orderTypeDetails = {
          type: 'dine-in',
          tableNumber: trimmedTable,
        };
      } else if (orderType === 'pickup') {
        orderTypeDetails = {
          type: 'pickup',
          customerName: trimmedName,
          phoneNumber: trimmedPhone,
          estimatedPickupTime: '',
        };
      } else {
        orderTypeDetails = {
          type: 'delivery',
          customerName: trimmedName,
          phoneNumber: trimmedPhone,
          address: {
            street: trimmedStreet,
            city: trimmedCity,
            zip: trimmedZip,
          },
          deliveryFee: DELIVERY_FEE,
          estimatedDeliveryTime: '',
        };
      }

      const orderItems: CartItem[] = items.map((item) => ({
        ...item,
        specialInstructions: item.specialInstructions ?? '',
        selectedCustomizations: item.selectedCustomizations ?? {},
      }));

      const order = await placeOrder(
        orderType,
        orderTypeDetails,
        paymentMethod,
        orderItems,
        cartSubtotal,
        cartTax,
        cartTotal
      );

      clearCart();
      navigate(`/confirmation/${order.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Order Type</h2>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {orderTypeLabel}
        </span>

        {orderType === 'dine-in' ? (
          <Input
            label="Table Number"
            value={tableNumber}
            onChange={(event) => {
              setTableNumber(event.target.value);
              setStoreTableNumber(event.target.value);
            }}
            placeholder="Enter your table number"
            error={errors.tableNumber}
            required
          />
        ) : null}
      </section>

      <ContactForm
        customerName={customerName}
        phoneNumber={phoneNumber}
        onCustomerNameChange={setCustomerName}
        onPhoneNumberChange={setPhoneNumber}
        errors={{
          customerName: errors.customerName,
          phoneNumber: errors.phoneNumber,
        }}
      />

      {orderType === 'delivery' ? (
        <DeliveryAddressForm
          street={street}
          city={city}
          zip={zip}
          onStreetChange={setStreet}
          onCityChange={setCity}
          onZipChange={setZip}
          errors={{
            street: errors.street,
            city: errors.city,
            zip: errors.zip,
          }}
        />
      ) : null}

      <PaymentMethodSelector orderType={orderType} selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} />

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Order Summary</h2>
        <CartSummary
          subtotal={cartSubtotal}
          tax={cartTax}
          deliveryFee={orderType === 'delivery' ? cartDeliveryFee : 0}
          total={cartTotal}
        />
      </section>

      <Button fullWidth loading={submitting} onClick={handlePlaceOrder}>
        Place Order
      </Button>
    </main>
  );
}
