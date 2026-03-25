import { Input } from '@/components/ui/Input';

interface ContactFormErrors {
  customerName?: string;
  phoneNumber?: string;
}

interface ContactFormProps {
  customerName: string;
  phoneNumber: string;
  onCustomerNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  errors: ContactFormErrors;
}

export function ContactForm({
  customerName,
  phoneNumber,
  onCustomerNameChange,
  onPhoneNumberChange,
  errors,
}: ContactFormProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Contact Information</h2>
      <div className="grid gap-3">
        <Input
          label="Full Name"
          value={customerName}
          onChange={(event) => onCustomerNameChange(event.target.value)}
          error={errors.customerName}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
        <Input
          label="Phone Number"
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange(event.target.value)}
          error={errors.phoneNumber}
          placeholder="Enter your phone number"
          autoComplete="tel"
          required
        />
      </div>
    </section>
  );
}
