import React from 'react';
import { EditHomepageSectionWrapper } from '@/features/homepage/components/EditHomepageSectionWrapper';
import { PageHeader } from '@/components/ui/page-header';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function EditHomepageSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Edit Homepage Section"
        description="Modify the section configuration and content."
      />
      <EditHomepageSectionWrapper id={id} />
    </div>
  );
}
