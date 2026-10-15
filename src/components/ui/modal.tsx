'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    if (isOpen) {
      openerRef.current = (document.activeElement as HTMLElement) || null;
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      document.body.style.overflow = 'hidden';
      // Auto-focus first element
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }, 10);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';
      if (openerRef.current && typeof openerRef.current.focus === 'function') {
        openerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden overflow-y-auto p-0 outline-none focus:outline-none sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-[#07182d]/60 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-lg sm:mx-auto sm:my-6">
        <div
          ref={modalRef}
          className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-[0_24px_70px_rgba(6,24,45,0.28)] outline-none focus:outline-none sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-[#e8edf3] px-6 py-5">
            <h3 id="modal-title" className="text-xl font-bold tracking-[-0.02em] text-[#17263b]">
              {title}
            </h3>
            <button
              className="ml-auto grid h-9 w-9 place-items-center rounded-xl border-0 bg-[#f2f5f8] text-gray-500 outline-none transition hover:bg-[#e8edf3] hover:text-[#17263b] focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)]"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative flex-auto overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
