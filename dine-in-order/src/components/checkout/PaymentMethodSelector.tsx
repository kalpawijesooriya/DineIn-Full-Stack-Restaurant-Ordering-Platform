import type { OrderType, PaymentMethodType } from '@/types';

interface PaymentMethodSelectorProps {
  orderType: OrderType;
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
}

interface PaymentOption {
  value: PaymentMethodType;
  label: string;
  description: string;
}

export function PaymentMethodSelector({ orderType, selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const orderSpecificOption: PaymentOption =
    orderType === 'delivery'
      ? {
          value: 'cashOnDelivery',
          label: 'Cash on Delivery',
          description: 'Pay with cash when your order arrives.',
        }
      : {
          value: 'payAtCounter',
          label: 'Pay at Counter',
          description: 'Complete payment when you collect or dine in.',
        };

  const options: PaymentOption[] = [
    orderSpecificOption,
    {
      value: 'none',
      label: 'Pay Later / Skip',
      description: 'Continue without selecting a payment method for now.',
    },
  ];

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Payment Method</h2>
      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selectedMethod === option.value;

          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onMethodChange(option.value)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <div>
                  <p className="font-medium text-slate-900">{option.label}</p>
                  <p className="text-sm text-slate-600">{option.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
