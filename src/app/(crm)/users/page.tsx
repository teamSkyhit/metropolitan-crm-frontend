'use client';

import { PageHeader } from '@/components/ui/page-header';
import { UserList } from '@/features/users/components/UserList';
import { Suspense, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { canAccessRoute } from '@/features/auth/permissions';
import { ROUTES } from '@/lib/constants/routes';
import { ROLES } from '@/lib/constants/roles';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccessRoute(user.role, ROUTES.USERS)) {
      router.replace(user.role === ROLES.CRM_USER ? ROUTES.ENQUIRIES : ROUTES.DASHBOARD);
    }
  }, [user, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & access"
        description="Create and manage CRM users, control account access, and reset credentials."
      />
      <Suspense
        fallback={
          <div
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            aria-label="Loading users"
          />
        }
      >
        <UserList />
      </Suspense>
    </div>
  );
}
