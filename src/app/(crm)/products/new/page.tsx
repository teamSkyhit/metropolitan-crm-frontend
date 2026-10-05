'use client';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useCreateProduct } from '@/features/products/hooks/useProduct';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (
    data: Partial<import('@/features/products/types').CreateProductRequest>
  ) => {
    setErrorMsg(null);
    createProduct.mutate(data as import('@/features/products/types').CreateProductRequest, {
      onSuccess: (res) => {
        router.push(`${ROUTES.PRODUCTS}/${res.data.id}`);
      },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onError: (err: any) => {
        setErrorMsg(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to create product.'
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.PRODUCTS}
          className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium transition-colors hover:bg-gray-100"
        >
          Back
        </Link>
        <PageHeader title="Create Product" description="Add a new product to the catalog." />
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <ProductForm mode="create" onSubmit={handleSubmit} isPending={createProduct.isPending} />
    </div>
  );
}
