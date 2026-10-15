import React, { Suspense } from 'react';
import { HomepageSectionList } from '@/features/homepage/components/HomepageSectionList';
import { PageHeader } from '@/components/ui/page-header';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomepageCMSPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Homepage CMS"
          description="Manage the sections displayed on the public website homepage."
        />
        <Link
          href="/homepage/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,47,87,0.18)] transition-all hover:bg-[#173e6e]"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Link>
      </div>

      <Suspense
        fallback={
          <div
            className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white"
            aria-label="Loading homepage sections"
          />
        }
      >
        <HomepageSectionList />
      </Suspense>
    </div>
  );
}
