'use client';

import React, { useState } from 'react';
import { useBrand, useDeleteBrand, useRestoreBrand } from '@/features/brands/hooks/useBrands';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { BrandImageManager } from '@/features/brands/components/BrandImageManager';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';

export function BrandEditClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: brand, isLoading, error } = useBrand(id);
  const deleteBrand = useDeleteBrand();
  const restoreBrand = useRestoreBrand();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!id || isLoading) {
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
        aria-label="Loading brand"
      />
    );
  }

  if (error || !brand) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700"
      >
        Failed to load this brand. Return to brands and try again.
      </div>
    );
  }

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    setIsConfirmOpen(false);
    try {
      await deleteBrand.mutateAsync(brand.id);
      toast.success('Brand deleted successfully.');
      router.push('/brands');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      toast.error(
        err?.response?.data?.error?.message ??
          err?.response?.data?.message ??
          'Failed to delete brand.'
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restoreBrand.mutateAsync(brand.id);
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      toast.error(
        err?.response?.data?.error?.message ??
          err?.response?.data?.message ??
          'Failed to restore brand.'
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/brands"
            aria-label="Back to brands"
            className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <PageHeader
            title="Edit brand"
            description="Update brand information, visibility, logo, and banner artwork."
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            onClick={handleRestore}
            disabled={restoreBrand.isPending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restore
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteBrand.isPending}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <BrandForm initialData={brand} />
        <BrandImageManager brand={brand} />
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Brand"
        message="Are you sure you want to delete this brand?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
