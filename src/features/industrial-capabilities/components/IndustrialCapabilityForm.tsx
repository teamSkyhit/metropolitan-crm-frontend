/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCreateIndustrialCapability,
  useUpdateIndustrialCapability,
  useRestoreIndustrialCapability,
} from '../hooks/useIndustrialCapabilities';
import { industrialCapabilitiesService } from '../industrial-capabilities.service';
import { IndustrialCapability, CreateIndustrialCapabilityRequest } from '../types';
import {
  Upload,
  X,
  Image as ImageIcon,
  Factory,
  Layers,
  Sparkles,
  Check,
  LoaderCircle,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { Media } from '@/features/media/types';
import { urlToFile } from '@/lib/utils/media';
import { IconPicker } from '@/components/ui/icon-picker/IconPicker';
import { TypicalProductsEditor } from './TypicalProductsEditor';
import { ROUTES } from '@/lib/constants/routes';

interface IndustrialCapabilityFormProps {
  initialData?: IndustrialCapability;
}

export function IndustrialCapabilityForm({ initialData }: IndustrialCapabilityFormProps) {
  const router = useRouter();

  // Image upload states
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [formData, setFormData] = useState<CreateIndustrialCapabilityRequest>({
    number: initialData?.number ?? '',
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    icon: initialData?.icon ?? '',
    shortDescription: initialData?.shortDescription ?? '',
    description: initialData?.description ?? '',
    typicalProducts: initialData?.typicalProducts ?? [],
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
    imageUrl: initialData?.imageUrl ?? null,
  });

  const [error, setError] = useState<string>('');
  const [deletedConflictId, setDeletedConflictId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const createMutation = useCreateIndustrialCapability();
  const updateMutation = useUpdateIndustrialCapability();
  const restoreMutation = useRestoreIndustrialCapability();

  const isPending = createMutation.isPending || updateMutation.isPending || isRestoring;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'slug' && deletedConflictId) {
      setDeletedConflictId(null);
      setError('');
    }

    setFormData((prev) => {
      const next = { ...prev };

      if (type === 'checkbox') {
        next[name as keyof CreateIndustrialCapabilityRequest] = (e.target as HTMLInputElement)
          .checked as never;
      } else if (type === 'number') {
        next[name as keyof CreateIndustrialCapabilityRequest] = (
          value === '' ? 0 : Number(value)
        ) as never;
      } else {
        next[name as keyof CreateIndustrialCapabilityRequest] = value as never;
      }

      // Auto-generate slug on creation
      if (name === 'title' && !initialData) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      return next;
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file exceeds 5MB limit.');
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
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleMediaModalSelect = async (media: Media) => {
    setIsMediaModalOpen(false);
    try {
      const file = await urlToFile(media);
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: media.publicUrl || media.thumbnailUrl }));
    } catch {
      toast.error('Failed to load selected media image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Description validation
    if (formData.description && formData.description.length > 5000) {
      setError('Description cannot exceed 5000 characters');
      return;
    }

    if (formData.shortDescription && formData.shortDescription.length > 500) {
      setError('Short description cannot exceed 500 characters');
      return;
    }

    try {
      const payload: CreateIndustrialCapabilityRequest = {
        number: formData.number?.trim() || null,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon ? formData.icon.trim() : null,
        shortDescription: formData.shortDescription?.trim() || null,
        description: formData.description?.trim() || null,
        typicalProducts: formData.typicalProducts || [],
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive ?? true,
        imageUrl: formData.imageUrl || null,
      };

      let capabilityId = initialData?.id;

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        capabilityId = created.id;
      }

      // Upload image if a new file was chosen
      if (capabilityId && selectedImageFile) {
        try {
          await industrialCapabilitiesService.uploadImage(capabilityId, selectedImageFile);
        } catch (imgErr) {
          console.error('Failed to upload capability image:', imgErr);
          toast.error('Capability saved, but image upload failed.');
        }
      }

      toast.success(
        initialData
          ? 'Industrial capability updated successfully'
          : 'Industrial capability created successfully'
      );
      router.push(ROUTES.INDUSTRIAL_CAPABILITIES);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          data?: {
            error?: {
              code?: string;
              message?: string;
              details?: { capabilityId?: string };
            };
            message?: string;
          };
        };
      };
      const errorData = errorObj.response?.data?.error;
      const msg =
        errorData?.message ||
        errorObj.response?.data?.message ||
        'An error occurred while saving the industrial capability';

      const isDeletedConflict =
        errorData?.code === 'INDUSTRIAL_CAPABILITY_SLUG_BELONGS_TO_DELETED' ||
        msg.toLowerCase().includes('deleted industrial capability');

      if (isDeletedConflict && errorData?.details?.capabilityId) {
        setDeletedConflictId(errorData.details.capabilityId);
      } else {
        setDeletedConflictId(null);
      }

      setError(msg);
      toast.error(msg);
    }
  };

  const handleRestoreConflict = async () => {
    if (!deletedConflictId) return;
    setIsRestoring(true);
    try {
      // 1. Restore the deleted capability
      await restoreMutation.mutateAsync(deletedConflictId);

      // 2. Overwrite with current form state
      const payload: CreateIndustrialCapabilityRequest = {
        number: formData.number?.trim() || null,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon ? formData.icon.trim() : null,
        shortDescription: formData.shortDescription?.trim() || null,
        description: formData.description?.trim() || null,
        typicalProducts: formData.typicalProducts || [],
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive ?? true,
        imageUrl: formData.imageUrl || null,
      };

      await updateMutation.mutateAsync({ id: deletedConflictId, payload });

      // 3. Upload image if selected
      if (selectedImageFile) {
        try {
          await industrialCapabilitiesService.uploadImage(deletedConflictId, selectedImageFile);
        } catch (imgErr) {
          console.error('Failed to upload capability image:', imgErr);
        }
      }

      toast.success('Industrial capability restored and updated successfully!');
      router.push(ROUTES.INDUSTRIAL_CAPABILITIES);
    } catch (restoreErr: unknown) {
      const errObj = restoreErr as {
        response?: { data?: { error?: { message?: string }; message?: string } };
      };
      const msg =
        errObj.response?.data?.error?.message ||
        errObj.response?.data?.message ||
        'Failed to restore the capability';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  const activeImageUrl = imagePreview || formData.imageUrl || initialData?.imageUrl;
  const descCount = formData.description?.length || 0;
  const isDescOver = descCount > 5000;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <ShieldAlert size={16} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">{error}</p>
              {deletedConflictId ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isRestoring || isPending}
                    onClick={handleRestoreConflict}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    {isRestoring
                      ? 'Restoring & Saving...'
                      : 'Restore Existing Capability & Apply Form Data'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        slug: `${prev.slug || 'capability'}-${Math.floor(100 + Math.random() * 900)}`,
                      }));
                      setError('');
                      setDeletedConflictId(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-50"
                  >
                    Suggest Alternative Slug
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Main Details Column (8 cols) ── */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Core Information */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Factory className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Capability Information</h2>
                <p className="text-xs text-slate-500">
                  Core identification and storefront SEO configuration.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Segment No.
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number ?? ''}
                    placeholder="e.g. 01"
                    maxLength={20}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Badge/numeral prefix.</p>
                </div>

                <div className="md:col-span-9">
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span>
                      Capability Title <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Required</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    placeholder="e.g. Precision Gears & Transmission"
                    maxLength={200}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                  />
                </div>
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
                    /capabilities/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    placeholder="precision-gears-transmission"
                    maxLength={120}
                    onChange={handleChange}
                    className={`h-11 w-full rounded-xl border bg-white pl-28 pr-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 ${
                      deletedConflictId
                        ? 'border-red-400 hover:border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-slate-200 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10'
                    }`}
                  />
                </div>
                {deletedConflictId ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Slug &quot;{formData.slug}&quot; belongs to a deleted capability. Click
                    &quot;Restore Existing Capability&quot; above or enter a different slug here.
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Lowercase letters, numbers, and hyphens (e.g. power-transmission).
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Short Description
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {(formData.shortDescription || '').length} / 500
                  </span>
                </div>
                <textarea
                  name="shortDescription"
                  rows={2}
                  maxLength={500}
                  value={formData.shortDescription ?? ''}
                  placeholder="A concise summary displayed on capability teaser cards..."
                  onChange={handleChange}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Description
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      isDescOver ? 'font-bold text-red-600' : 'text-slate-400'
                    }`}
                  >
                    {descCount} / 5000
                  </span>
                </div>
                <textarea
                  name="description"
                  rows={6}
                  maxLength={5000}
                  value={formData.description ?? ''}
                  placeholder="Detailed technical specifications, engineering capabilities, machinery, and tolerances..."
                  onChange={handleChange}
                  className={`w-full resize-y rounded-xl border bg-white p-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    isDescOver
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-[#102f57]/10'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Typical Products */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Typical Products</h2>
                <p className="text-xs text-slate-500">
                  Sample manufactured products and components in this industrial segment.
                </p>
              </div>
            </div>

            <div className="p-6">
              <TypicalProductsEditor
                products={formData.typicalProducts || []}
                onChange={(products) =>
                  setFormData((prev) => ({ ...prev, typicalProducts: products }))
                }
              />
            </div>
          </div>
        </div>

        {/* ── Sidebar Column (4 cols) ── */}
        <div className="space-y-6 lg:col-span-4">
          {/* Status & Order Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="rounded-t-2xl border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h3 className="text-sm font-bold text-slate-900">Publishing & Positioning</h3>
            </div>
            <div className="space-y-5 p-6">
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-800">Active Status</span>
                  <span className="block text-xs text-slate-400">
                    Visible on public website section
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 rounded-md border-slate-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
                />
              </label>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sort Order
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
                  Ordering index in storefront listing.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Segment Icon
                </label>
                <IconPicker
                  value={formData.icon || ''}
                  onChange={(iconKey) => setFormData((prev) => ({ ...prev, icon: iconKey }))}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Visual symbol representing this capability.
                </p>
              </div>
            </div>
          </div>

          {/* Image Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Capability Image</h3>
            </div>

            <div className="space-y-4 p-6">
              {activeImageUrl ? (
                <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={activeImageUrl}
                    alt="Capability preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-lg bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/80"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                  <ImageIcon className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">No image attached</p>
                  <p className="text-[10px] text-slate-400">Upload or select from Media Library</p>
                </div>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFileChange}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Upload size={13} />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ImageIcon size={13} />
                  Media Library
                </button>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending || isDescOver}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-metro-navy)] px-5 text-sm font-semibold text-white shadow-md shadow-black/10 transition hover:bg-[#153866] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {initialData ? 'Update Capability' : 'Create Capability'}
            </button>
            <button
              type="button"
              onClick={() => router.push(ROUTES.INDUSTRIAL_CAPABILITIES)}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaModalSelect}
      />
    </form>
  );
}
