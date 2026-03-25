import { Input } from '@/components/ui/Input';

interface DeliveryAddressErrors {
  street?: string;
  city?: string;
  zip?: string;
}

interface DeliveryAddressFormProps {
  street: string;
  city: string;
  zip: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onZipChange: (value: string) => void;
  errors: DeliveryAddressErrors;
}

export function DeliveryAddressForm({
  street,
  city,
  zip,
  onStreetChange,
  onCityChange,
  onZipChange,
  errors,
}: DeliveryAddressFormProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Delivery Address</h2>
      <Input
        label="Street Address"
        value={street}
        onChange={(event) => onStreetChange(event.target.value)}
        error={errors.street}
        placeholder="123 Main Street"
        autoComplete="street-address"
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="City"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          error={errors.city}
          placeholder="City"
          autoComplete="address-level2"
          required
        />
        <Input
          label="ZIP Code"
          value={zip}
          onChange={(event) => onZipChange(event.target.value)}
          error={errors.zip}
          placeholder="ZIP"
          autoComplete="postal-code"
          required
        />
      </div>
    </section>
  );
}
