import React from 'react';
import { HomepageSectionForm } from '@/features/homepage/components/HomepageSectionForm';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHomepageSectionPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/homepage"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
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
