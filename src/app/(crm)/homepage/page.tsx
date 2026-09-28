import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function HomepagePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Homepage" description="Manage your homepage here." />
      <EmptyState />
    </div>
  );
}
