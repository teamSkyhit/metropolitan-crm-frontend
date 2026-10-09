'use client';

import { ReactNode, useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { useAuthStore } from '@/features/auth/auth.store';

import { Toaster } from 'react-hot-toast';

export function AppProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryProvider>
      <Toaster position="top-right" />
      {children}
    </QueryProvider>
  );
}
