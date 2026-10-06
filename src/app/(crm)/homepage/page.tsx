import React, { Suspense } from 'react';
import { HomepageSectionList } from '@/features/homepage/components/HomepageSectionList';
import { PageHeader } from '@/components/ui/page-header';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomepageCMSPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Homepage CMS"
          description="Manage the sections displayed on the public website homepage."
        />
        <Link
          href="/homepage/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-metro-navy)] hover:bg-[var(--color-metro-gold)] rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Link>
      </div>

      <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading...</div>}>
        <HomepageSectionList />
      </Suspense>
    </div>
  );
}
