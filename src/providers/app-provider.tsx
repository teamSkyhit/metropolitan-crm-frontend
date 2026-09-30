'use client';

import { ReactNode, useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { useAuthStore } from '@/features/auth/auth.store';

export function AppProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <QueryProvider>{children}</QueryProvider>;
}
