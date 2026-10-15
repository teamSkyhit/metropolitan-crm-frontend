'use client';
import React, { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { ProductTable } from '@/features/products/components/ProductTable';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';

function ProductsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const limit = 20;

  const query = {
    page,
    limit,
    search: searchParams.get('search') || undefined,
    brandId: searchParams.get('brandId') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    status: searchParams.get('status')
      ? (searchParams.get('status') as import('@/features/products/types').ProductStatus)
      : undefined,
    hotDeal: searchParams.get('hotDeal') || undefined,
    sortBy:
      (searchParams.get(
        'sortBy'
      ) as import('@/features/products/types').GetProductsQuery['sortBy']) || undefined,
    sortOrder:
      (searchParams.get(
        'sortOrder'
      ) as import('@/features/products/types').GetProductsQuery['sortOrder']) || undefined,
  };

  const { data, isLoading, isError, refetch } = useProducts(query);

  const totalPages = data?.meta?.pagination?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800">Failed to load products</h3>
        <p className="text-sm text-red-600 mt-2 mb-4">
          There was an error communicating with the server.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <ProductFilters />

      <ProductTable products={data?.data || []} isLoading={isLoading} />

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-xs sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-bold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Products" description="Manage your product catalog." />
        <Link
          href={ROUTES.PRODUCTS + '/new'}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,47,87,0.18)] transition-all hover:bg-[#173e6e]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <Suspense
        fallback={
          <div
            className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white"
            aria-label="Loading products"
          />
        }
      >
        <ProductsList />
      </Suspense>
    </div>
  );
}
