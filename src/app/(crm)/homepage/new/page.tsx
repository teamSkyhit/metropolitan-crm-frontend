import React from 'react';
import { HomepageSectionForm } from '@/features/homepage/components/HomepageSectionForm';
import { PageHeader } from '@/components/ui/page-header';

export default function NewHomepageSectionPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Add Homepage Section"
        description="Create a new section for the public homepage."
      />
      <HomepageSectionForm />
    </div>
  );
}
