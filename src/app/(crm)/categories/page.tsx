'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryTable } from '@/features/categories/components/CategoryTable';
import { CategoryFilters } from '@/features/categories/components/CategoryFilters';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || undefined;
  const isActiveParam = searchParams.get('isActive');

  let isActive: boolean | undefined = undefined;
  if (isActiveParam === 'true') isActive = true;
  if (isActiveParam === 'false') isActive = false;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data, isLoading, isError, refetch } = useCategories({
    page,
    limit: 10,
    search,
    isActive,
  });

  if (isError) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center my-6">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800">Failed to load categories</h3>
          <p className="text-sm text-red-600 mt-2 mb-4">
            There was an error communicating with the server.
          </p>
          <Button onClick={() => refetch()} variant="destructive">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Categories" description="Organise and manage your product catalogue." />
        <Link
          href="/categories/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,47,87,0.18)] transition-all hover:bg-[#173e6e]"
        >
          <Plus size={16} />
          New Category
        </Link>
      </div>

      <CategoryFilters />

      <CategoryTable categories={data?.data || []} isLoading={isLoading} />

      {data && data?.meta?.pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-xs sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {(data?.meta?.pagination.page - 1) * data?.meta?.pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(
                data?.meta?.pagination.page * data?.meta?.pagination.limit,
                data?.meta?.pagination.total
              )}
            </span>{' '}
            of <span className="font-bold text-slate-800">{data?.meta?.pagination.total}</span> categories
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(data?.meta?.pagination.page - 1)}
              disabled={data?.meta?.pagination.page === 1}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-bold text-slate-600">
              {data?.meta?.pagination.page} / {data?.meta?.pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(data?.meta?.pagination.page + 1)}
              disabled={data?.meta?.pagination.page === data?.meta?.pagination.totalPages}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white"
          aria-label="Loading categories"
        />
      }
    >
      <CategoriesPageContent />
    </Suspense>
  );
}
