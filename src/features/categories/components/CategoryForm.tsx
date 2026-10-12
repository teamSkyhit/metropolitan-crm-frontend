/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCategory, useUpdateCategory, useCategories } from '../hooks/useCategories';
import { categoriesService } from '../categories.service';
import { Category, CreateCategoryRequest } from '../types';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            required
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <select
            name="parentId"
            value={formData.parentId ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None (Top Level)</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Category Thumbnail / Card Image ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Thumbnail / Card Image
        </label>
        <p className="text-xs text-gray-500 mb-2">Listing card image (Max 5MB: PNG, JPEG, WebP).</p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={imagePreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : initialData?.imageUrl ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={initialData.imageUrl}
                alt={`${initialData.name} current image`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-[10px]">No image</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isPending}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {imagePreview || initialData?.imageUrl ? 'Change Image' : 'Select Image'}
            </button>
            <button
              type="button"
              onClick={() => setIsImageMediaOpen(true)}
              disabled={isPending}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FileImage className="w-4 h-4 mr-1.5 text-gray-600" />
              Select Media
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Banner Image ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Banner Image
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Recommended high-resolution banner image (Max 5MB: PNG, JPEG, WebP).
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
            <div className="relative group w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearBanner}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                title="Remove banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : initialData?.bannerUrl ? (
            <div className="w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={initialData.bannerUrl}
                alt={`${initialData.name} current banner`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-xs">No banner chosen</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isPending}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {bannerPreview || initialData?.bannerUrl ? 'Change Banner' : 'Select Banner'}
            </button>
            <button
              type="button"
              onClick={() => setIsBannerMediaOpen(true)}
              disabled={isPending}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FileImage className="w-4 h-4 mr-1.5 text-gray-600" />
              Select Media
            </button>
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <input
          type="number"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/categories')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
