'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { CategoryImageManager } from '@/features/categories/components/CategoryImageManager';
import { useCategory } from '@/features/categories/hooks/useCategories';
import { PageHeader } from '@/components/ui/page-header';

export function CategoryEditClient({ id }: { id: string }) {
  const { data: category, isLoading, error } = useCategory(id);

  if (!id || isLoading) {
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
        aria-label="Loading category"
      />
    );
  }

  if (error || !category) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700"
      >
        Failed to load this category. Return to categories and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/categories"
          aria-label="Back to categories"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageHeader
          title="Edit category"
          description="Update category details, storefront visibility, and artwork."
        />
      </div>

      <div className="space-y-6">
        <CategoryForm initialData={category} />
        <CategoryImageManager category={category} />
      </div>
    </div>
  );
}
