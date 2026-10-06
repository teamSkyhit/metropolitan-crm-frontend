'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCategory, useUpdateCategory, useCategories } from '../hooks/useCategories';
import { Category, CreateCategoryRequest } from '../types';

interface CategoryFormProps {
  initialData?: Category;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
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
      } else {
        await createMutation.mutateAsync(payload);
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
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
