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
import { AlertCircle } from 'lucide-react';

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
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  className="rounded-l-md rounded-r-none"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-r-md rounded-l-none border-l-0"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Products" description="Manage your product catalog." />
        <Link
          href={ROUTES.PRODUCTS + '/new'}
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-metro-navy)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-metro-navy)]/90"
        >
          Add Product
        </Link>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
