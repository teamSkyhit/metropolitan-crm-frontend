/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';
import {
  useUploadCategoryBanner,
  useDeleteCategoryBanner,
  useUploadCategoryImage,
  useDeleteCategoryImage,
} from '../hooks/useCategories';
import { Category } from '../types';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { Media } from '@/features/media/types';
import { urlToFile } from '@/lib/utils/media';

interface CategoryImageManagerProps {
  category: Category;
}

export function CategoryImageManager({ category }: CategoryImageManagerProps) {
  // Banner state
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isBannerConfirmOpen, setIsBannerConfirmOpen] = useState(false);
  const [isBannerMediaOpen, setIsBannerMediaOpen] = useState(false);

  // Image state
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isImageConfirmOpen, setIsImageConfirmOpen] = useState(false);
  const [isImageMediaOpen, setIsImageMediaOpen] = useState(false);

  const uploadBanner = useUploadCategoryBanner();
  const deleteBanner = useDeleteCategoryBanner();
  const uploadImage = useUploadCategoryImage();
  const deleteImage = useDeleteCategoryImage();

  const getErrorMessage = (err: unknown, fallback: string) => {
    const errorObj = err as {
      response?: { data?: { error?: { message?: string }; message?: string } };
    };
    return (
      errorObj?.response?.data?.error?.message || errorObj?.response?.data?.message || fallback
    );
  };

  // Banner handlers
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadBanner.mutateAsync({ id: category.id, image: file });
      toast.success('Category banner updated successfully.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload banner.'));
    } finally {
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleDeleteBanner = async () => {
    setIsBannerConfirmOpen(false);
    try {
      await deleteBanner.mutateAsync(category.id);
      toast.success('Category banner removed.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to remove banner.'));
    }
  };

  const handleBannerMediaSelect = async (media: Media) => {
    setIsBannerMediaOpen(false);
    try {
      const file = await urlToFile(media);
      await uploadBanner.mutateAsync({ id: category.id, image: file });
      toast.success('Banner updated from media library.');
    } catch {
      toast.error('Failed to set banner from media library.');
    }
  };

  // Image handlers
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImage.mutateAsync({ id: category.id, image: file });
      toast.success('Category thumbnail image updated successfully.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload image.'));
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    setIsImageConfirmOpen(false);
    try {
      await deleteImage.mutateAsync(category.id);
      toast.success('Category thumbnail image removed.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to remove image.'));
    }
  };

  const handleImageMediaSelect = async (media: Media) => {
    setIsImageMediaOpen(false);
    try {
      const file = await urlToFile(media);
      await uploadImage.mutateAsync({ id: category.id, image: file });
      toast.success('Image updated from media library.');
    } catch {
      toast.error('Failed to set image from media library.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Category Thumbnail Image ── */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">Category Thumbnail / Card Image</h3>
          <p className="text-xs text-gray-500">
            Used on listing grids and navigation cards (JPG, PNG, WebP, Max 5MB).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {category.imageUrl ? (
            <div className="relative group w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
              <img
                src={category.imageUrl}
                alt={`${category.name} image`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsImageConfirmOpen(true)}
                disabled={uploadImage.isPending || deleteImage.isPending}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-gray-400 flex-shrink-0">
              <ImageIcon size={32} className="mb-1 text-gray-300" />
              <span className="text-[11px]">No Image</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadImage.isPending || deleteImage.isPending}
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload size={14} className="mr-1.5" />
              {category.imageUrl ? 'Change Image' : 'Upload Image'}
            </button>
            <button
              type="button"
              disabled={uploadImage.isPending || deleteImage.isPending}
              onClick={() => setIsImageMediaOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FileImage size={14} className="mr-1.5 text-gray-600" />
              Select Media
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Banner ── */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">Category Banner</h3>
          <p className="text-xs text-gray-500">
            Wide hero banner displayed on the Category Header page (JPG, PNG, WebP, Max 5MB).
          </p>
        </div>

        <div className="flex flex-col items-center">
          {category.bannerUrl ? (
            <div className="relative w-full max-w-lg">
              <img
                src={category.bannerUrl}
                alt={`${category.name} banner`}
                className="w-full h-44 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setIsBannerConfirmOpen(true)}
                disabled={uploadBanner.isPending || deleteBanner.isPending}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 shadow-sm"
                title="Remove banner"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full max-w-lg h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-gray-500">
              <ImageIcon size={40} className="mb-2 text-gray-400" />
              <p className="text-xs">No banner image uploaded</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2.5 justify-center">
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadBanner.isPending || deleteBanner.isPending}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload size={14} className="mr-1.5" />
              {category.bannerUrl ? 'Change Banner' : 'Upload Banner'}
            </button>
            <button
              type="button"
              onClick={() => setIsBannerMediaOpen(true)}
              disabled={uploadBanner.isPending || deleteBanner.isPending}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FileImage size={14} className="mr-1.5 text-gray-600" />
              Select Media
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isImageConfirmOpen}
        title="Remove Thumbnail Image"
        message="Are you sure you want to remove this category thumbnail image?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDeleteImage}
        onCancel={() => setIsImageConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isBannerConfirmOpen}
        title="Remove Banner"
        message="Are you sure you want to remove this category banner?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDeleteBanner}
        onCancel={() => setIsBannerConfirmOpen(false)}
      />

      {/* Media Selector Modals */}
      <MediaSelectorModal
        isOpen={isImageMediaOpen}
        onClose={() => setIsImageMediaOpen(false)}
        onSelect={handleImageMediaSelect}
      />

      <MediaSelectorModal
        isOpen={isBannerMediaOpen}
        onClose={() => setIsBannerMediaOpen(false)}
        onSelect={handleBannerMediaSelect}
      />
    </div>
  );
}
