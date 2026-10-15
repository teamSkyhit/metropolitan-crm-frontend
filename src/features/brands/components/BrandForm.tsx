/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import { brandsService } from '../brands.service';
import { Brand } from '../types';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileImage,
  Tag,
  Sparkles,
  Eye,
  Check,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { urlToFile } from '@/lib/utils/media';

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

  const [isLogoMediaOpen, setIsLogoMediaOpen] = useState(false);
  const [isBannerMediaOpen, setIsBannerMediaOpen] = useState(false);

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
  const activeLogoUrl = logoPreview || initialData?.logoUrl;
  const activeBannerUrl = bannerPreview || initialData?.bannerUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            !
          </div>
          <div className="flex-1">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Main Form Column (8 cols) ── */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Details */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Tag className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Brand Information</h2>
                <p className="text-xs text-slate-500">
                  Official manufacturer or partner identity displayed on catalog products.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                  <span>
                    Brand Name <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Herman Miller, Steelcase, Festo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Brand heritage, core industrial specializations, or certified warranties..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Storefront Artwork */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Brand Artwork & Logos</h2>
                <p className="text-xs text-slate-500">
                  Official logos and banners to highlight this manufacturer.
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Brand Logo Upload */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Brand Logo (Square / Icon)
                    </span>
                    <p className="text-xs text-slate-400">
                      Square logo with transparent or white background (Max 5MB).
                    </p>
                  </div>
                  {activeLogoUrl && (
                    <button
                      type="button"
                      onClick={clearSelectedLogo}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
                  {activeLogoUrl ? (
                    <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
                      <img
                        src={activeLogoUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedLogo}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                        title="Remove logo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="flex aspect-square w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-[var(--color-metro-navy)] hover:text-[var(--color-metro-navy)]"
                    >
                      <ImageIcon className="mb-1 h-6 w-6" />
                      <span className="text-[11px] font-semibold">Upload Logo</span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Displayed on product spec sheets, brand filter lists, and manufacturer landing
                      cards.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isPending}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-98"
                      >
                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                        {activeLogoUrl ? 'Replace Logo' : 'Select Local File'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogoMediaOpen(true)}
                        disabled={isPending}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-98"
                      >
                        <FileImage className="h-3.5 w-3.5 text-blue-600" />
                        Media Library
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Banner Upload */}
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Brand Hero Banner (Wide 3:1)
                    </span>
                    <p className="text-xs text-slate-400">
                      High-resolution manufacturer banner for dedicated brand landing pages.
                    </p>
                  </div>
                  {activeBannerUrl && (
                    <button
                      type="button"
                      onClick={clearSelectedBanner}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  {activeBannerUrl ? (
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                      <img
                        src={activeBannerUrl}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedBanner}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                        title="Remove banner"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex aspect-[3.5/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-slate-400 transition hover:border-[var(--color-metro-navy)] hover:text-[var(--color-metro-navy)]"
                    >
                      <ImageIcon className="mb-1.5 h-7 w-7" />
                      <span className="text-xs font-semibold">Upload Brand Banner (3:1)</span>
                      <span className="mt-0.5 text-[10px] text-slate-400">
                        PNG, JPG, or WebP up to 5MB
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={isPending}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-98"
                    >
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      {activeBannerUrl ? 'Change Banner' : 'Select Local Banner'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBannerMediaOpen(true)}
                      disabled={isPending}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-98"
                    >
                      <FileImage className="h-3.5 w-3.5 text-blue-600" />
                      Choose from Media
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Side Settings Column (4 cols) ── */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card: Action / Submit Button */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Publishing Actions
            </h3>
            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={isPending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,47,87,0.2)] transition hover:bg-[#153866] active:scale-98 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Saving Brand...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{initialData ? 'Update Brand' : 'Save Brand'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/brands')}
                disabled={isPending}
                className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-98"
              >
                Cancel and Return
              </button>
            </div>
          </div>

          {/* Card: Visibility & Sort */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Settings & Visibility
            </h3>

            <div
              onClick={() => setIsActive(!isActive)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                isActive
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  id="isActiveBrand"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {isActive ? 'Active Brand' : 'Draft / Inactive'}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {isActive
                    ? 'Brand is live and selectable for products.'
                    : 'Hidden from public lists and filter bars.'}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Lower numbers appear first in customer brand directories.
              </p>
            </div>
          </div>

          {/* Card: Live Storefront Brand Card Preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Storefront Brand Preview
              </h3>
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs transition hover:shadow-md">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 shadow-2xs">
                {activeLogoUrl ? (
                  <img
                    src={activeLogoUrl}
                    alt={name || 'Brand'}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Tag className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <h4 className="truncate text-sm font-bold text-slate-900">{name || 'Brand Name'}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {description || 'Official manufacturer details.'}
              </p>
              <div className="mt-3 flex items-center justify-center border-t border-slate-100 pt-2.5 text-xs font-bold text-[var(--color-metro-navy)]">
                View Brand Catalogue <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={isLogoMediaOpen}
        onClose={() => setIsLogoMediaOpen(false)}
        onSelect={async (media) => {
          setIsLogoMediaOpen(false);
          try {
            const file = await urlToFile(media);
            setSelectedLogo(file);
            setLogoPreview(URL.createObjectURL(file));
          } catch {
            toast.error('Failed to load selected media.');
          }
        }}
      />

      <MediaSelectorModal
        isOpen={isBannerMediaOpen}
        onClose={() => setIsBannerMediaOpen(false)}
        onSelect={async (media) => {
          setIsBannerMediaOpen(false);
          try {
            const file = await urlToFile(media);
            setSelectedBanner(file);
            setBannerPreview(URL.createObjectURL(file));
          } catch {
            toast.error('Failed to load selected media.');
          }
        }}
      />
    </form>
  );
}
