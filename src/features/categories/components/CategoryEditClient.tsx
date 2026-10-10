'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { CategoryImageManager } from '@/features/categories/components/CategoryImageManager';
import { useCategory } from '@/features/categories/hooks/useCategories';
import { useParams } from 'next/navigation';

export function CategoryEditClient({ id: _propId }: { id: string }) {
  const params = useParams();
  // Read the real ID from the URL at runtime (the prop is always "placeholder" in static export)
  const id = (params?.id as string) || _propId;
  const { data: category, isLoading, error } = useCategory(id);

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading category...</div>;
  }

  if (error || !category) {
    return <div className="p-6 text-center text-red-500">Failed to load category.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center">
        <Link href="/categories" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Category: {category.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryForm initialData={category} />
        </div>
        <div>
          <CategoryImageManager category={category} />
        </div>
      </div>
    </div>
  );
}
