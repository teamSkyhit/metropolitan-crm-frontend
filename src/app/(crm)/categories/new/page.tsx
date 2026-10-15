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
          className="mt-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
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
