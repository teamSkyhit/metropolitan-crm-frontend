'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddProductKeyBenefit,
  useUpdateProductKeyBenefit,
  useReorderProductKeyBenefits,
  useDeleteProductKeyBenefit,
  useSetRelatedProducts,
  useUploadProductGallery,
  useReorderProductGallery,
  useSetProductPrimaryImage,
  useDeleteProductGalleryImage,
  useUploadProductVideos,
  useUpdateProductVideo,
  useReorderProductVideos,
  useDeleteProductVideo,
  useUploadProductDocuments,
  useUpdateProductDocument,
  useReorderProductDocuments,
  useDeleteProductDocument,
} from '@/features/products/hooks/useProduct';
import { ProductForm } from '@/features/products/components/ProductForm';
import { ProductSpecificationsEditor } from '@/features/products/components/ProductSpecificationsEditor';
import { ProductKeyBenefitsEditor } from '@/features/products/components/ProductKeyBenefitsEditor';
import { RelatedProductsSelector } from '@/features/products/components/RelatedProductsSelector';
import { ProductGalleryManager } from '@/features/products/components/ProductGalleryManager';
import { ProductImageManager } from '@/features/products/components/ProductImageManager';
import { ProductVideoManager } from '@/features/products/components/ProductVideoManager';
import { ProductDocumentManager } from '@/features/products/components/ProductDocumentManager';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ProductEditClient({ id }: { id: string }) {
  const router = useRouter();

  const { data, isLoading, isError } = useProduct(id);
  const updateProduct = useUpdateProduct(id);
  const deleteProduct = useDeleteProduct(id);

  // Subresource hooks
  const addKeyBenefit = useAddProductKeyBenefit(id);
  const updateKeyBenefit = useUpdateProductKeyBenefit(id);
  const reorderKeyBenefits = useReorderProductKeyBenefits(id);
  const deleteKeyBenefit = useDeleteProductKeyBenefit(id);

  const setRelatedProducts = useSetRelatedProducts(id);

  const uploadGallery = useUploadProductGallery(id);
  const reorderGallery = useReorderProductGallery(id);
  const setPrimaryGallery = useSetProductPrimaryImage(id);
  const deleteGallery = useDeleteProductGalleryImage(id);

  const uploadVideos = useUploadProductVideos(id);
  const updateVideo = useUpdateProductVideo(id);
  const reorderVideos = useReorderProductVideos(id);
  const deleteVideo = useDeleteProductVideo(id);

  const uploadDocs = useUploadProductDocuments(id);
  const updateDoc = useUpdateProductDocument(id);
  const reorderDocs = useReorderProductDocuments(id);
  const deleteDoc = useDeleteProductDocument(id);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!id || isLoading) {
    return (
      <div
        className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white"
        aria-label="Loading product"
      />
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="space-y-6">
        <Link
          href={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-metro-navy)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
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
      onError: (err: unknown) => {
        const errorObj = err as {
          response?: {
            data?: {
              error?: {
                message?: string;
                details?: Array<{ field?: string; message?: string }>;
              };
              message?: string;
            };
          };
        };
        const errorData = errorObj?.response?.data?.error;
        let msg =
          errorData?.message || errorObj?.response?.data?.message || 'Failed to update product.';
        if (
          errorData?.details &&
          Array.isArray(errorData.details) &&
          errorData.details.length > 0
        ) {
          const detailStr = errorData.details
            .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
            .filter(Boolean)
            .join('; ');
          msg = `${msg}: ${detailStr}`;
        }
        toast.error(msg);
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
      onError: (err: unknown) => {
        const errorObj = err as {
          response?: { data?: { error?: { message?: string }; message?: string } };
        };
        toast.error(
          errorObj?.response?.data?.error?.message ||
            errorObj?.response?.data?.message ||
            'Failed to delete product.'
        );
      },
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={ROUTES.PRODUCTS}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dce3ec] bg-white text-gray-500 transition hover:bg-[#f8fafc] hover:text-[#17263b]"
          aria-label="Back to Products"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <PageHeader title={product.name} description={`SKU: ${product.sku}`} />
        </div>
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
        >
          {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
        </Button>
      </div>

      <nav
        aria-label="Product editor sections"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:hidden"
      >
        {[
          ['#product-core', 'Details'],
          ['#product-specifications', 'Specifications'],
          ['#product-benefits', 'Benefits'],
          ['#product-media', 'Media'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Core Info & Content Sections */}
        <div className="space-y-6 xl:col-span-2">
          <div id="product-core" className="scroll-mt-24">
            <ProductForm
              initialData={product}
              mode="edit"
              onSubmit={handleUpdate}
              isPending={updateProduct.isPending}
            />
          </div>

          {/* Specifications */}
          <ProductSpecificationsEditor product={product} />

          {/* Key Benefits */}
          <div
            id="product-benefits"
            className="scroll-mt-24 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6"
          >
            <ProductKeyBenefitsEditor
              benefits={product.keyBenefits || []}
              onAddAsync={async (ben) => {
                await addKeyBenefit.mutateAsync(ben);
              }}
              onUpdateAsync={async (benefitId, ben) => {
                await updateKeyBenefit.mutateAsync({ benefitId, payload: ben });
              }}
              onReorderAsync={async (ids) => {
                await reorderKeyBenefits.mutateAsync(ids);
              }}
              onDeleteAsync={async (benefitId) => {
                await deleteKeyBenefit.mutateAsync(benefitId);
              }}
            />
          </div>

          {/* Related Products */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Related Products</h4>
            <p className="text-xs text-gray-500 mb-4">
              Select other products from the catalog to recommend on this product&apos;s detail
              page.
            </p>
            <RelatedProductsSelector
              currentProductId={product.id}
              selectedProducts={product.relatedProducts || []}
              onChange={async (newRelated) => {
                await setRelatedProducts.mutateAsync(newRelated.map((p) => p.id));
              }}
              disabled={setRelatedProducts.isPending}
            />
          </div>
        </div>

        {/* Right Column: Media Subresources */}
        <div id="product-media" className="scroll-mt-24 space-y-6">
          {/* Primary Product Image */}
          <ProductImageManager product={product} />

          {/* Gallery */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductGalleryManager
              gallery={product.gallery || []}
              onUploadAsync={async (files) => {
                await uploadGallery.mutateAsync(files);
              }}
              onReorderAsync={async (imageIds) => {
                await reorderGallery.mutateAsync(imageIds);
              }}
              onSetPrimaryAsync={async (galleryImageId) => {
                await setPrimaryGallery.mutateAsync(galleryImageId);
              }}
              onDeleteAsync={async (galleryImageId) => {
                await deleteGallery.mutateAsync(galleryImageId);
              }}
            />
          </div>

          {/* Videos */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductVideoManager
              videos={product.videos || []}
              onUploadAsync={async (files, title) => {
                await uploadVideos.mutateAsync({ files, title });
              }}
              onUpdateTitleAsync={async (videoId, title) => {
                await updateVideo.mutateAsync({ videoId, payload: { title } });
              }}
              onReorderAsync={async (videoIds) => {
                await reorderVideos.mutateAsync(videoIds);
              }}
              onDeleteAsync={async (videoId) => {
                await deleteVideo.mutateAsync(videoId);
              }}
            />
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductDocumentManager
              documents={product.documents || []}
              onUploadAsync={async (files, title) => {
                await uploadDocs.mutateAsync({ files, title });
              }}
              onUpdateTitleAsync={async (documentId, title) => {
                await updateDoc.mutateAsync({ documentId, payload: { title } });
              }}
              onReorderAsync={async (documentIds) => {
                await reorderDocs.mutateAsync(documentIds);
              }}
              onDeleteAsync={async (documentId) => {
                await deleteDoc.mutateAsync(documentId);
              }}
            />
          </div>
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
