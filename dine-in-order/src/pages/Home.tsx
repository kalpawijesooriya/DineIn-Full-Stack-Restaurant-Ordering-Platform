import { useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Modal } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';

type OrderOption = {
  id: 'dine-in' | 'pickup' | 'delivery';
  title: string;
  description: string;
  icon: ReactElement;
};

const ORDER_OPTIONS: OrderOption[] = [
  {
    id: 'dine-in',
    title: 'Dine In',
    description: 'Order from your table',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 5v6M8 5v6M5 8h3M19 5v14M19 5c1.5 0 2.5 1.2 2.5 2.8V11H16V7.8C16 6.2 17.2 5 19 5Z" />
        <path d="M3 19h18" />
      </svg>
    ),
  },
  {
    id: 'pickup',
    title: 'Pickup',
    description: 'Ready when you arrive',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 8h14l-1.2 10H6.2L5 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Delivered to your door',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M2 7h11v8H2V7Z" />
        <path d="M13 10h3l3 3v2h-6v-5Z" />
        <circle cx="7" cy="17" r="1.8" />
        <circle cx="17" cy="17" r="1.8" />
      </svg>
    ),
  },
];

function getTableNumberError(value: string): string {
  if (!value.trim()) {
    return 'Table number is required';
  }

  if (!/^\d+$/.test(value.trim())) {
    return 'Table number must be numeric';
  }

  return '';
}

export default function Home() {
  const navigate = useNavigate();
  const currentOrderType = useCartStore((state) => state.orderType);
  const setOrderType = useCartStore((state) => state.setOrderType);
  const setCartTableNumber = useCartStore((state) => state.setTableNumber);

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableError, setTableError] = useState('');

  const handleOrderTypeSelect = (orderType: 'dine-in' | 'pickup' | 'delivery') => {
    if (orderType === 'dine-in') {
      setShowTableModal(true);
      return;
    }

    setOrderType(orderType);
    navigate('/menu');
  };

  const handleCloseModal = () => {
    setShowTableModal(false);
    setTableError('');
  };

  const handleConfirmDineIn = () => {
    const errorMessage = getTableNumberError(tableNumber);
    if (errorMessage) {
      setTableError(errorMessage);
      return;
    }

    setOrderType('dine-in');
    setCartTableNumber(tableNumber);
    setShowTableModal(false);
    navigate('/menu');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Welcome</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">Dine-In</h1>
          <p className="mt-4 text-xl font-medium text-slate-700">Fresh food, fast ordering</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose how you want your meal and start ordering in seconds. Quick, smooth, and built for hungry moments.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {ORDER_OPTIONS.map((option) => {
            const isActive = currentOrderType === option.id;

            return (
              <Card
                key={option.id}
                onClick={() => handleOrderTypeSelect(option.id)}
                className={`group border-2 p-6 transition duration-200 ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-[0_12px_32px_-20px_rgba(226,55,68,0.8)]'
                    : 'border-slate-200 hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`inline-flex rounded-2xl p-3 ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {option.icon}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-slate-900">{option.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{option.description}</p>
                  </div>
                  {isActive ? (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">Current</span>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </section>
      </div>

      <Modal isOpen={showTableModal} onClose={handleCloseModal} title="Enter table number">
        <div className="space-y-4">
          <Input
            label="Table number"
            placeholder="e.g. 12"
            value={tableNumber}
            onChange={(event) => {
              setTableNumber(event.target.value);
              if (tableError) {
                setTableError('');
              }
            }}
            error={tableError}
            inputMode="numeric"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDineIn}>Continue to menu</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}