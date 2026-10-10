'use client';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useCreateProduct } from '@/features/products/hooks/useProduct';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (
    data: Partial<import('@/features/products/types').CreateProductRequest>
  ) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // 1. Create product record
      const res = await createProduct.mutateAsync(
        data as import('@/features/products/types').CreateProductRequest
      );
      const newProductId = res.data.id;

      // 2. If user selected an image during creation, upload it now
      if (selectedImage) {
        try {
          const { productsService } = await import('@/features/products/products.service');
          await productsService.updateProductImage(newProductId, selectedImage);
        } catch (
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          imgErr: any
        ) {
          console.error('Failed to upload image after product creation:', imgErr);
          // Non-blocking for product navigation, but show toast warning
          const toast = (await import('react-hot-toast')).default;
          toast.error(
            'Product created, but failed to upload image. You can re-upload on the edit page.'
          );
        }
      }

      router.push(`${ROUTES.PRODUCTS}/${newProductId}`);
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any
    ) {
      setErrorMsg(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to create product.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.PRODUCTS}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Back to Products"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title="Create Product" description="Add a new product to the catalog." />
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        isPending={isSubmitting}
        imageFile={selectedImage}
        onImageChange={setSelectedImage}
      />
    </div>
  );
}
