import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Manage your categories here." />
      <EmptyState />
    </div>
  );
}
