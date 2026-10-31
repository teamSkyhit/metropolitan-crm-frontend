import React from 'react';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';

export default function NewBrandPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/brands"
          aria-label="Back to brands"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageHeader
          title="Create brand"
          description="Add brand details and storefront artwork. Required fields are marked with *."
        />
      </div>

      <BrandForm />
    </div>
  );
}
