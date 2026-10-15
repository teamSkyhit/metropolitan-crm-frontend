'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../auth.store';
import { ROUTES } from '@/lib/constants/routes';
import { canAccessRoute } from '../permissions';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing, role } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        // Redirect to login with original destination
        const redirectUrl = pathname
          ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`
          : ROUTES.LOGIN;
        router.replace(redirectUrl);
      } else if (!canAccessRoute(role, pathname)) {
        // Logged in but no permission
        router.replace(ROUTES.FORBIDDEN);
      }
    }
  }, [isAuthenticated, isInitializing, router, pathname, role]);

  if (isInitializing) {
    return (
      <div
        className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-[#f4f7fb]"
        role="status"
        aria-live="polite"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d8e0ea] border-t-[var(--color-metro-navy)]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-[#65758b]">Preparing your workspace…</p>
      </div>
    );
  }

  // Prevent flash while redirecting
  if (!isAuthenticated || !canAccessRoute(role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
