/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCategory, useUpdateCategory, useCategories } from '../hooks/useCategories';
import { categoriesService } from '../categories.service';
import { Category, CreateCategoryRequest } from '../types';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileImage,
  FolderTree,
  Layers,
  Sparkles,
  Eye,
  Check,
  ChevronDown,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { urlToFile } from '@/lib/utils/media';

interface CategoryFormProps {
  initialData?: Category;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();

  // Banner image states
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isBannerMediaOpen, setIsBannerMediaOpen] = useState(false);

  // Thumbnail image states
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageMediaOpen, setIsImageMediaOpen] = useState(false);

  const { data: categoriesResponse } = useCategories({ limit: 100 });
  const parentCategories = categoriesResponse?.data?.filter((c) => c.id !== initialData?.id) || [];

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder ?? 0,
    parentId: initialData?.parentId ?? '',
  });

  const [error, setError] = useState<string>('');

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (type === 'checkbox') {
        newData[name as keyof CreateCategoryRequest] = (e.target as HTMLInputElement)
          .checked as never;
      } else if (type === 'number') {
        newData[name as keyof CreateCategoryRequest] = (value === '' ? 0 : Number(value)) as never;
      } else {
        newData[name as keyof CreateCategoryRequest] = value as never;
      }

      // Auto-generate slug if name is typed and it's a new category
      if (name === 'name' && !initialData) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      return newData;
    });
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

    setSelectedBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearBanner = () => {
    setSelectedBannerFile(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail file exceeds 5MB limit.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId === '' ? null : formData.parentId,
      };

      let categoryId = initialData?.id;

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        categoryId = created.id;
      }

      // Upload banner if selected
      if (categoryId && selectedBannerFile) {
        try {
          await categoriesService.uploadBanner(categoryId, selectedBannerFile);
        } catch (imgErr) {
          console.error('Failed to upload category banner:', imgErr);
          toast.error('Category saved, but banner upload failed.');
        }
      }

      // Upload thumbnail image if selected
      if (categoryId && selectedImageFile) {
        try {
          await categoriesService.uploadImage(categoryId, selectedImageFile);
        } catch (imgErr) {
          console.error('Failed to upload category image:', imgErr);
          toast.error('Category saved, but thumbnail upload failed.');
        }
      }

      router.push('/categories');
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { error?: { message?: string }; message?: string } };
      };
      setError(
        errorObj?.response?.data?.error?.message ??
          errorObj?.response?.data?.message ??
          'An error occurred'
      );
    }
  };

  const selectedParentCategory = parentCategories.find((c) => c.id === formData.parentId);
  const activeThumbnailUrl = imagePreview || initialData?.imageUrl;
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
                <FolderTree className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Category Information</h2>
                <p className="text-xs text-slate-500">
                  Customer-facing identity and storefront URL path.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span>
                      Category Name <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Required</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    placeholder="e.g. Ergonomic Office Chairs"
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span>
                      URL Slug <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">SEO path</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3 select-none text-xs font-medium text-slate-400">
                      /
                    </span>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      placeholder="office-chairs"
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-6 pr-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Lowercase letters, numbers and hyphens.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description ?? ''}
                  placeholder="Provide an informative overview of the products in this category..."
                  onChange={handleChange}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Hierarchy & Positioning */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Hierarchy & Placement</h2>
                <p className="text-xs text-slate-500">
                  Set parent relationships and sort order in menus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Parent Category
                </label>
                <div className="relative">
                  <select
                    name="parentId"
                    value={formData.parentId ?? ''}
                    onChange={handleChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-sm font-medium text-slate-800 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {parentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Leave as top level if this should appear in main menu bar.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Display Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Lower numbers (0, 1, 2...) appear first in storefront listings.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Storefront Artwork */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Storefront Artwork</h2>
                <p className="text-xs text-slate-500">
                  High-resolution imagery for catalogue cards and header banners.
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Thumbnail section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Category Thumbnail / Card Image
                    </span>
                    <p className="text-xs text-slate-400">
                      Square listing card image (Max 5MB: PNG, JPEG, WebP). Recommended 600×600px.
                    </p>
                  </div>
                  {activeThumbnailUrl && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
                  {activeThumbnailUrl ? (
                    <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                      <img
                        src={activeThumbnailUrl}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="flex aspect-square w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-[var(--color-metro-navy)] hover:text-[var(--color-metro-navy)]"
                    >
                      <ImageIcon className="mb-1 h-6 w-6" />
                      <span className="text-[11px] font-semibold">Upload</span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Display across category grids, homepage featured collections, and navigation
                      flyouts.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isPending}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-98"
                      >
                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                        {activeThumbnailUrl ? 'Replace Image' : 'Select Local File'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsImageMediaOpen(true)}
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

              {/* Banner section */}
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Category Banner Image
                    </span>
                    <p className="text-xs text-slate-400">
                      High-resolution wide header banner (Max 5MB: PNG, JPEG, WebP). Recommended
                      1920×640px.
                    </p>
                  </div>
                  {activeBannerUrl && (
                    <button
                      type="button"
                      onClick={clearBanner}
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
                        onClick={clearBanner}
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
                      <span className="text-xs font-semibold">Upload Category Banner (3:1)</span>
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
                    <span>Saving Category...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{initialData ? 'Update Category' : 'Create Category'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/categories')}
                disabled={isPending}
                className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-98"
              >
                Cancel and Return
              </button>
            </div>
          </div>

          {/* Card: Status & Visibility */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Visibility Status
            </h3>

            <div
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                formData.isActive
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {formData.isActive ? 'Active and Published' : 'Draft / Hidden'}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      formData.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formData.isActive
                    ? 'Category is live on the public storefront and visible in navigation.'
                    : 'Category is saved in CRM but hidden from public customers.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Live Storefront Card Preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Storefront Preview
              </h3>
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {activeThumbnailUrl ? (
                  <img
                    src={activeThumbnailUrl}
                    alt={formData.name || 'Preview'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                    <ImageIcon className="h-8 w-8" />
                    <span className="mt-1 text-[11px]">No Thumbnail</span>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      formData.isActive
                        ? 'bg-emerald-500/90 text-white backdrop-blur-xs'
                        : 'bg-slate-800/80 text-white backdrop-blur-xs'
                    }`}
                  >
                    {formData.isActive ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                {selectedParentCategory && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {selectedParentCategory.name}
                  </span>
                )}
                <h4 className="truncate text-sm font-bold text-slate-900">
                  {formData.name || 'Untitled Category'}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {formData.description || 'No description provided yet.'}
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                  <span className="font-mono truncate max-w-[150px]">
                    /{formData.slug || 'slug'}
                  </span>
                  <span className="flex items-center text-[var(--color-metro-navy)] font-semibold">
                    Explore <ArrowRight className="ml-0.5 h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={isImageMediaOpen}
        onClose={() => setIsImageMediaOpen(false)}
        onSelect={async (media) => {
          setIsImageMediaOpen(false);
          try {
            const file = await urlToFile(media);
            setSelectedImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          } catch {
            toast.error('Failed to load selected media image.');
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
            setSelectedBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
          } catch {
            toast.error('Failed to load selected media banner.');
          }
        }}
      />
    </form>
  );
}
