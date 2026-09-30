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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-metro-navy)]"></div>
      </div>
    );
  }

  // Prevent flash while redirecting
  if (!isAuthenticated || !canAccessRoute(role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
