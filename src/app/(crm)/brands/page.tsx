import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage your brands here." />
      <EmptyState />
    </div>
  );
}
