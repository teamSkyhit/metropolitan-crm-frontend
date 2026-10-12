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
  useAddProductFeature,
  useUpdateProductFeature,
  useReorderProductFeatures,
  useDeleteProductFeature,
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
import { ProductFeaturesEditor } from '@/features/products/components/ProductFeaturesEditor';
import { ProductKeyBenefitsEditor } from '@/features/products/components/ProductKeyBenefitsEditor';
import { RelatedProductsSelector } from '@/features/products/components/RelatedProductsSelector';
import { ProductGalleryManager } from '@/features/products/components/ProductGalleryManager';
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
  const addFeature = useAddProductFeature(id);
  const updateFeature = useUpdateProductFeature(id);
  const reorderFeatures = useReorderProductFeatures(id);
  const deleteFeature = useDeleteProductFeature(id);

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
        {/* Left Column: Core Info & Content Sections */}
        <div className="lg:col-span-2 space-y-6">
          <ProductForm
            initialData={product}
            mode="edit"
            onSubmit={handleUpdate}
            isPending={updateProduct.isPending}
          />

          {/* Specifications */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <ProductSpecificationsEditor product={product} />
          </div>

          {/* Features */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <ProductFeaturesEditor
              features={product.features || []}
              onAddAsync={async (feat) => {
                await addFeature.mutateAsync(feat);
              }}
              onUpdateAsync={async (featureId, feat) => {
                await updateFeature.mutateAsync({ featureId, payload: feat });
              }}
              onReorderAsync={async (ids) => {
                await reorderFeatures.mutateAsync(ids);
              }}
              onDeleteAsync={async (featureId) => {
                await deleteFeature.mutateAsync(featureId);
              }}
            />
          </div>

          {/* Key Benefits */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
        <div className="space-y-6">
          {/* Gallery */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
