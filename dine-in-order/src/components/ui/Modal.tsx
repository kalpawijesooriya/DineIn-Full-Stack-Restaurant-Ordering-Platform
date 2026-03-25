import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  bodyClassName?: string;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  bodyClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      const closeTimer = window.setTimeout(() => setMounted(false), 200);
      return () => window.clearTimeout(closeTimer);
    }

    setMounted(true);
    const frameId = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('overflow-hidden');

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      dialogRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
      previousFocusRef.current?.focus();
    };
  }, [mounted]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    if (!focusableElements || focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={`w-full ${maxWidth} rounded-2xl bg-white shadow-xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={`px-5 py-4 ${bodyClassName ?? ''}`}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export type { ModalProps };
