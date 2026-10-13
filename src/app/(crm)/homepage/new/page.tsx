import React from 'react';
import { HomepageSectionForm } from '@/features/homepage/components/HomepageSectionForm';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHomepageSectionPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/homepage"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Back to Homepage CMS"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <PageHeader
            title="Add Homepage Section"
            description="Create a new section for the public homepage."
          />
        </div>
      </div>
      <HomepageSectionForm />
    </div>
  );
}
