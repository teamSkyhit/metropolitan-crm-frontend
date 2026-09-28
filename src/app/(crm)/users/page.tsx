import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage your users here." />
      <EmptyState />
    </div>
  );
}
