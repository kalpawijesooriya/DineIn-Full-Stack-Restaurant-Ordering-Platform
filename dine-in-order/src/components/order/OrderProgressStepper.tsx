import type { OrderStatus } from '@/types';

interface OrderProgressStepperProps {
  currentStatus: OrderStatus;
}

const steps: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

export function OrderProgressStepper({ currentStatus }: OrderProgressStepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  return (
    <section aria-label="Order progress" className="rounded-2xl border border-slate-200 bg-white p-4">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.key}
              className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-center sm:gap-2"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {index > 0 ? (
                <span
                  className={`absolute left-4 top-0 h-5 w-0.5 -translate-x-1/2 sm:left-0 sm:top-4 sm:h-0.5 sm:w-full sm:-translate-x-1/2 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'animate-pulse bg-primary text-white'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              <span
                className={`text-sm font-medium transition-colors ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
