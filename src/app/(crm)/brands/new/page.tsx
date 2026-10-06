import React from 'react';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBrandPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/brands"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Brands
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Brand</h1>
      </div>

      <BrandForm />
    </div>
  );
}
