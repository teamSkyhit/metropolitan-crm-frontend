'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import { ROLES } from '@/lib/constants/roles';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing, role } = useAuthStore();

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else if (role === ROLES.CRM_USER) {
        router.replace(ROUTES.ENQUIRIES);
      } else {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isInitializing, role, router]);

  return null;
}
