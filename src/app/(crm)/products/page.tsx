import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your products here." />
      <EmptyState />
    </div>
  );
}
