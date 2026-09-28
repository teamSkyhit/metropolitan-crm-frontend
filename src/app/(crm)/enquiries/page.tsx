import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function EnquiriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="Manage your enquiries here." />
      <EmptyState />
    </div>
  );
}
