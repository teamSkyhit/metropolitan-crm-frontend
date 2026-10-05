import React, { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BrandTable } from '@/features/brands/components/BrandTable';

export default function BrandsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands and their assets.</p>
        </div>
        <Link
          href="/brands/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Link>
      </div>

      <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading brands...</div>}>
        <BrandTable />
      </Suspense>
    </div>
  );
}
