'use client';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/features/products/hooks/useProduct';
import { ProductForm } from '@/features/products/components/ProductForm';
import { ProductImageManager } from '@/features/products/components/ProductImageManager';
import { ProductSpecificationsEditor } from '@/features/products/components/ProductSpecificationsEditor';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ProductEditClient({ id: _propId }: { id: string }) {
  const params = useParams();
  // Read the real ID from the URL at runtime (the prop is always "placeholder" in static export)
  const id = (params?.id as string) || _propId;
  const router = useRouter();
  const { data, isLoading, isError } = useProduct(id);
  const updateProduct = useUpdateProduct(id);
  const deleteProduct = useDeleteProduct(id);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-6">
        <Link href={ROUTES.PRODUCTS} className="text-[var(--color-metro-navy)] hover:underline">
          &larr; Back to Products
        </Link>
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
          Product not found.
        </div>
      </div>
    );
  }

  const product = data.data;

  const handleUpdate = (
    payload: Partial<import('@/features/products/types').CreateProductRequest>
  ) => {
    updateProduct.mutate(payload, {
      onSuccess: () => {
        toast.success('Product updated successfully.');
      },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to update product.'
        );
      },
    });
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    setShowConfirmDelete(false);
    deleteProduct.mutate(undefined, {
      onSuccess: () => {
        router.push(ROUTES.PRODUCTS);
      },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to delete product.'
        );
      },
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.PRODUCTS}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Back to Products"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <PageHeader title={product.name} description={`SKU: ${product.sku}`} />
        </div>
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
        >
          {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductForm
            initialData={product}
            mode="edit"
            onSubmit={handleUpdate}
            isPending={updateProduct.isPending}
          />
          <ProductSpecificationsEditor product={product} />
        </div>

        <div className="space-y-6">
          <ProductImageManager product={product} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        isDestructive={true}
      />
    </div>
  );
}
