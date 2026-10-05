'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import { Brand } from '../types';

interface BrandFormProps {
  initialData?: Brand;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (initialData) {
        await updateBrand.mutateAsync({
          id: initialData.id,
          data: { name, description, isActive, sortOrder: Number(sortOrder) },
        });
      } else {
        await createBrand.mutateAsync({
          name,
          description,
          isActive,
          sortOrder: Number(sortOrder),
        });
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
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Brand'}
        </button>
      </div>
    </form>
  );
}
