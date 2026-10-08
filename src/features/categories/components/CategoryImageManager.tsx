/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUploadCategoryBanner, useDeleteCategoryBanner } from '../hooks/useCategories';
import { Category } from '../types';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface CategoryImageManagerProps {
  category: Category;
}

export function CategoryImageManager({ category }: CategoryImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const uploadMutation = useUploadCategoryBanner();
  const deleteMutation = useDeleteCategoryBanner();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      await uploadMutation.mutateAsync({ id: category.id, image: file });
      toast.success('Banner uploaded successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMessage = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to upload banner';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setError('');
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success('Banner removed successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMessage = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to delete banner';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isPending = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Category Banner</h3>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Remove Banner"
        message="Are you sure you want to remove this banner?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="mt-2 flex flex-col items-center">
        {category.bannerUrl ? (
          <div className="relative w-full max-w-md">
            <img
              src={category.bannerUrl}
              alt={`${category.name} banner`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => setIsConfirmOpen(true)}
              disabled={isPending}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
              title="Remove banner"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <ImageIcon size={48} className="mb-2 text-gray-400" />
            <p className="text-sm">No banner image uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload size={16} className="mr-2" />
            {category.bannerUrl ? 'Change Banner' : 'Upload Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}
