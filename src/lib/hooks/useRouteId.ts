'use client';

import { useParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';

function getPathId(): string | null {
  if (typeof window === 'undefined') return null;
  const segments = window.location.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return last && last !== 'placeholder' ? last : null;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

export function useRouteId(): string | null {
  const params = useParams();
  const paramId = params?.id as string | undefined;

  const pathId = useSyncExternalStore(
    subscribe,
    getPathId,
    () => null // Server snapshot
  );

  if (paramId && paramId !== 'placeholder') return paramId;
  return pathId;
}
