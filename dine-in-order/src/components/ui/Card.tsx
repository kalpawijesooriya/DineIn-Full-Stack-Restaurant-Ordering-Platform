import type { KeyboardEvent, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

function mergeClasses(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ');
}

export function Card({ children, className, onClick, padding = true }: CardProps) {
  const interactive = typeof onClick === 'function';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={mergeClasses(
        'rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70',
        padding && 'p-4 sm:p-5',
        interactive &&
          'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export type { CardProps };
