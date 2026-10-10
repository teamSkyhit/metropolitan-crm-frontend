'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryTable } from '@/features/categories/components/CategoryTable';
import { CategoryFilters } from '@/features/categories/components/CategoryFilters';

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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center my-6">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800">Failed to load categories</h3>
          <p className="text-sm text-red-600 mt-2 mb-4">
            There was an error communicating with the server.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <Link
          href="/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          New Category
        </Link>
      </div>

      <CategoryFilters />

      <CategoryTable categories={data?.data || []} isLoading={isLoading} />

      {data && data?.meta?.pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-t-0 border-gray-200 rounded-b-lg sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(data?.meta?.pagination.page - 1) * data?.meta?.pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    data?.meta?.pagination.page * data?.meta?.pagination.limit,
                    data?.meta?.pagination.total
                  )}
                </span>{' '}
                of <span className="font-medium">{data?.meta?.pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(data?.meta?.pagination.page - 1)}
                  disabled={data?.meta?.pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(data?.meta?.pagination.page + 1)}
                  disabled={data?.meta?.pagination.page === data?.meta?.pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
