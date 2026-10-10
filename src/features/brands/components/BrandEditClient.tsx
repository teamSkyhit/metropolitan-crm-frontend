'use client';

import React, { useState } from 'react';
import { useBrand, useDeleteBrand, useRestoreBrand } from '@/features/brands/hooks/useBrands';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { BrandImageManager } from '@/features/brands/components/BrandImageManager';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export function BrandEditClient({ id: _propId }: { id: string }) {
  const router = useRouter();
  const params = useParams();
  // Read the real ID from the URL at runtime (the prop is always "placeholder" in static export)
  const id = (params?.id as string) || _propId;
  const { data: brand, isLoading, error } = useBrand(id);
  const deleteBrand = useDeleteBrand();
  const restoreBrand = useRestoreBrand();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading brand details...</div>;
  }

  if (error || !brand) {
    return <div className="p-6 text-red-500">Failed to load brand.</div>;
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
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link href="/brands" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={restoreBrand.isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restore
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteBrand.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
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
