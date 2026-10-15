/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useBrands } from '../hooks/useBrands';
import { BrandFilters } from './BrandFilters';
import { Edit2, Image as ImageIcon, AlertCircle, RefreshCcw, LoaderCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function BrandTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || undefined;
  const isActiveParam = searchParams.get('isActive');
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

  const { data, isLoading, isError, refetch } = useBrands({
    page,
    limit: 10,
    search,
    isActive,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div
        role="alert"
        className="my-6 flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800">Failed to load brands</h3>
        <p className="text-sm text-red-600 mt-2 mb-4">
          There was an error communicating with the server.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BrandFilters />

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/75">
              <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Brand
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Slug Path
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Display Order
              </TableHead>
              <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                    <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-metro-navy)]" />
                    Loading brand directory...
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-700">No brands found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try adjusting your search criteria or add a new brand.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((brand) => (
                <TableRow
                  key={brand.id}
                  className="group border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                >
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                        {brand.logoUrl ? (
                          <img
                            className="h-full w-full object-contain"
                            src={brand.logoUrl}
                            alt={brand.name}
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/brands/${brand.id}`}
                          className="font-bold text-slate-900 transition hover:text-[var(--color-metro-navy)]"
                        >
                          {brand.name}
                        </Link>
                        {brand.description && (
                          <p className="max-w-xs truncate text-xs text-slate-400">
                            {brand.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="font-mono text-xs text-slate-500">/{brand.slug}</span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        brand.isActive
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          brand.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {brand.isActive ? 'Active' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-600">
                      {brand.sortOrder}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 pr-6 text-right">
                    <Link
                      href={`/brands/${brand.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-[var(--color-metro-navy)]"
                      aria-label="Edit brand"
                    >
                      <Edit2 size={13} />
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-3.5 sm:flex-row">
            <p className="text-xs font-medium text-slate-500">
              Showing{' '}
              <span className="font-bold text-slate-800">
                {(data.meta.pagination.page - 1) * data.meta.pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(
                  data.meta.pagination.page * data.meta.pagination.limit,
                  data.meta.pagination.total
                )}
              </span>{' '}
              of <span className="font-bold text-slate-800">{data.meta.pagination.total}</span>{' '}
              brands
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(data.meta.pagination.page - 1)}
                disabled={data.meta.pagination.page === 1}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-bold text-slate-600">
                {data.meta.pagination.page} / {data.meta.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(data.meta.pagination.page + 1)}
                disabled={data.meta.pagination.page === data.meta.pagination.totalPages}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
