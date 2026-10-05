'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryTable } from '@/features/categories/components/CategoryTable';
import { CategoryFilters } from '@/features/categories/components/CategoryFilters';

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || undefined;
  const isActiveParam = searchParams.get('isActive');

  let isActive: boolean | undefined = undefined;
  if (isActiveParam === 'true') isActive = true;
  if (isActiveParam === 'false') isActive = false;

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
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          New Category
        </Link>
      </div>

      <CategoryFilters />

      <CategoryTable categories={data?.data || []} isLoading={isLoading} />

      {/* Basic Pagination logic can be placed here if needed */}
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
