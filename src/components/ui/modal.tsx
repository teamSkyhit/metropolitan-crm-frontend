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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-500 float-right outline-none focus:outline-none hover:text-gray-700"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative p-6 flex-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
