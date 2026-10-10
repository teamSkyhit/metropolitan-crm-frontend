/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import { brandsService } from '../brands.service';
import { Brand } from '../types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandFormProps {
  initialData?: Brand;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [error, setError] = useState<string | null>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file exceeds 5MB limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setSelectedLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearSelectedLogo = () => {
    setSelectedLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Banner file exceeds 5MB limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setSelectedBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearSelectedBanner = () => {
    setSelectedBanner(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let brandId = initialData?.id;

      if (initialData) {
        await updateBrand.mutateAsync({
          id: initialData.id,
          data: { name, description, isActive, sortOrder: Number(sortOrder) },
        });
      } else {
        const created = await createBrand.mutateAsync({
          name,
          description,
          isActive,
          sortOrder: Number(sortOrder),
        });
        brandId = created.id;
      }

      if (brandId && selectedLogo) {
        try {
          await brandsService.uploadLogo(brandId, selectedLogo);
        } catch (logoErr) {
          console.error('Failed to upload logo:', logoErr);
          toast.error('Brand saved, but logo upload failed.');
        }
      }

      if (brandId && selectedBanner) {
        try {
          await brandsService.uploadBanner(brandId, selectedBanner);
        } catch (bannerErr) {
          console.error('Failed to upload banner:', bannerErr);
          toast.error('Brand saved, but banner upload failed.');
        }
      }

      router.push('/brands');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      setError(
        err?.response?.data?.error?.message ??
          err?.response?.data?.message ??
          'An error occurred while saving the brand.'
      );
    }
  };

  const isPending = createBrand.isPending || updateBrand.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-100"
    >
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Brand Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
        <p className="text-xs text-gray-500 mb-2">
          Square logo recommended (Max 5MB: PNG, JPEG, WebP).
        </p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {logoPreview ? (
            <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-full h-full object-contain p-1"
              />
              <button
                type="button"
                onClick={clearSelectedLogo}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                title="Remove selected logo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : initialData?.logoUrl ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <img
                src={initialData.logoUrl}
                alt={`${initialData.name} current logo`}
                className="w-full h-full object-contain p-1"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 flex-shrink-0">
              <ImageIcon className="w-5 h-5 mb-0.5 text-gray-400" />
              <span className="text-[10px]">No Logo</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {logoPreview || initialData?.logoUrl ? 'Change Logo' : 'Select Logo'}
          </button>
        </div>
      </div>

      {/* Brand Banner Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Banner</label>
        <p className="text-xs text-gray-500 mb-2">
          High-resolution wide banner recommended (Max 5MB: PNG, JPEG, WebP).
        </p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {bannerPreview ? (
            <div className="relative group w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearSelectedBanner}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                title="Remove selected banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : initialData?.bannerUrl ? (
            <div className="w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <img
                src={initialData.bannerUrl}
                alt={`${initialData.name} current banner`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 flex-shrink-0">
              <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-xs">No Banner</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {bannerPreview || initialData?.bannerUrl ? 'Change Banner' : 'Select Banner'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/brands')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 focus:outline-none disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving...' : 'Save Brand'}
        </button>
      </div>
    </form>
  );
}
