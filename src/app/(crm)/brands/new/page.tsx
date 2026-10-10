import React from 'react';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBrandPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6 flex items-center">
        <Link href="/brands" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Brand</h1>
      </div>

      <BrandForm />
    </div>
  );
}
