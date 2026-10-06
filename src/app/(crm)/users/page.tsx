import { PageHeader } from '@/components/ui/page-header';
import { UserList } from '@/features/users/components/UserList';
import { Suspense } from 'react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage your users here." />
      <Suspense fallback={<div>Loading...</div>}>
        <UserList />
      </Suspense>
    </div>
  );
}
