import React, { use } from 'react';
import { EditHomepageSectionWrapper } from '@/features/homepage/components/EditHomepageSectionWrapper';
import { PageHeader } from '@/components/ui/page-header';

export default function EditHomepageSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Edit Homepage Section"
        description="Modify the section configuration and content."
      />
      <EditHomepageSectionWrapper id={resolvedParams.id} />
    </div>
  );
}
