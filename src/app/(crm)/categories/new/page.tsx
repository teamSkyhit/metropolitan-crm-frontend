import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { PageHeader } from '@/components/ui/page-header';

export default function NewCategoryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/categories"
          aria-label="Back to categories"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageHeader
          title="Create category"
          description="Organize products into a clear storefront collection. Required fields are marked with *."
        />
      </div>

      <CategoryForm />
    </div>
  );
}
