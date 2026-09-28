'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {/* Additional global providers can go here, like ThemeProvider, ToastProvider, etc. */}
      {children}
    </QueryProvider>
  );
}
