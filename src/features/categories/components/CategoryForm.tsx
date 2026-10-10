/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCategory, useUpdateCategory, useCategories } from '../hooks/useCategories';
import { categoriesService } from '../categories.service';
import { Category, CreateCategoryRequest } from '../types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  initialData?: Category;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId === '' ? null : formData.parentId,
      };

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
        if (selectedFile) {
          try {
            await categoriesService.uploadBanner(initialData.id, selectedFile);
          } catch (imgErr) {
            console.error('Failed to upload category banner:', imgErr);
            toast.error('Category updated, but banner upload failed.');
          }
        }
      } else {
        const created = await createMutation.mutateAsync(payload);
        if (selectedFile) {
          try {
            await categoriesService.uploadBanner(created.id, selectedFile);
          } catch (imgErr) {
            console.error('Failed to upload category banner on creation:', imgErr);
            toast.error(
              'Category created, but banner upload failed. You can re-upload on edit page.'
            );
          }
        }
      }

      router.push('/categories');
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      setError(
        err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'An error occurred'
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          value={formData.description ?? ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <select
            name="parentId"
            value={formData.parentId ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {filePreview ? (
            <div className="relative group w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img src={filePreview} alt="Banner preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearSelectedFile}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                title="Remove selected image"
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
              <span className="text-xs">No image chosen</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {filePreview || initialData?.bannerUrl ? 'Change Image' : 'Select Image'}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push('/categories')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b2e59] disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
