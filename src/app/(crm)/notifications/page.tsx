import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Manage your notifications here." />
      <EmptyState />
    </div>
  );
}
