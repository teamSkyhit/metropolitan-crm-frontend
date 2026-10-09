/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Brand } from '../types';
import { useUploadLogo, useDeleteLogo, useUploadBanner, useDeleteBanner } from '../hooks/useBrands';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function BrandImageManager({ brand }: { brand: Brand }) {
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();
  const uploadBanner = useUploadBanner();
  const deleteBanner = useDeleteBanner();

  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [isLogoConfirmOpen, setIsLogoConfirmOpen] = useState(false);
  const [isBannerConfirmOpen, setIsBannerConfirmOpen] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    try {
      await uploadLogo.mutateAsync({ id: brand.id, file });
      toast.success('Logo uploaded successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMsg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to upload logo.';
      setLogoError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleLogoDelete = async () => {
    setIsLogoConfirmOpen(false);
    setLogoError(null);
    try {
      await deleteLogo.mutateAsync(brand.id);
      toast.success('Logo deleted successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMsg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to delete logo.';
      setLogoError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerError(null);
    try {
      await uploadBanner.mutateAsync({ id: brand.id, file });
      toast.success('Banner uploaded successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMsg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to upload banner.';
      setBannerError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleBannerDelete = async () => {
    setIsBannerConfirmOpen(false);
    setBannerError(null);
    try {
      await deleteBanner.mutateAsync(brand.id);
      toast.success('Banner deleted successfully');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      const errorMsg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Failed to delete banner.';
      setBannerError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Logo</h3>
        {logoError && <p className="text-red-500 text-sm mb-2">{logoError}</p>}
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="Logo" className="object-contain h-full w-full" />
            ) : (
              <ImageIcon className="text-gray-400 w-8 h-8" />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadLogo.isPending}
                />
              </label>
              {brand.logoUrl && (
                <button
                  type="button"
                  onClick={() => setIsLogoConfirmOpen(true)}
                  disabled={deleteLogo.isPending}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">Recommended size: 512x512px. PNG or JPG.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Banner</h3>
        {bannerError && <p className="text-red-500 text-sm mb-2">{bannerError}</p>}
        <div className="flex flex-col gap-4">
          <div className="h-32 w-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {brand.bannerUrl ? (
              <img src={brand.bannerUrl} alt="Banner" className="object-cover h-full w-full" />
            ) : (
              <ImageIcon className="text-gray-400 w-8 h-8" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Recommended size: 1200x400px. PNG or JPG.</p>
            <div className="flex gap-2">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                {uploadBanner.isPending ? 'Uploading...' : 'Upload Banner'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadBanner.isPending}
                />
              </label>
              {brand.bannerUrl && (
                <button
                  type="button"
                  onClick={() => setIsBannerConfirmOpen(true)}
                  disabled={deleteBanner.isPending}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoConfirmOpen}
        title="Delete Logo"
        message="Are you sure you want to delete the logo?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleLogoDelete}
        onCancel={() => setIsLogoConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isBannerConfirmOpen}
        title="Delete Banner"
        message="Are you sure you want to delete the banner?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleBannerDelete}
        onCancel={() => setIsBannerConfirmOpen(false)}
      />
    </div>
  );
}
