import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/features/categories/components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/categories" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Category</h1>
      </div>

      <CategoryForm />
    </div>
  );
}
