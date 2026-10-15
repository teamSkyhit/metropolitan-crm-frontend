import React, { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BrandTable } from '@/features/brands/components/BrandTable';
import { PageHeader } from '@/components/ui/page-header';

export default function BrandsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Brands" description="Manage product brands and their assets." />
        <Link
          href="/brands/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,47,87,0.18)] transition-all hover:bg-[#173e6e] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </Link>
      </div>

      <Suspense
        fallback={
          <div
            className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white"
            aria-label="Loading brands"
          />
        }
      >
        <BrandTable />
      </Suspense>
    </div>
  );
}
