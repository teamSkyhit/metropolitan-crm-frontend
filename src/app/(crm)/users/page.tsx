import { PageHeader } from '@/components/ui/page-header';
import { UserList } from '@/features/users/components/UserList';
import { Suspense } from 'react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & access"
        description="Create sales managers, control account access, and reset credentials."
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
