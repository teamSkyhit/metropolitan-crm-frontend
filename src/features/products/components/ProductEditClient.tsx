'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
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
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {[
          ['#product-core', '1. Details & Description'],
          ['#product-gallery', '4. Gallery & Media'],
          ['#product-specifications', '5. Specifications'],
          ['#product-related', '6. Related Products'],
          ['#product-legacy', '7. Inactive / Supplementary'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Sequential Form Sections Matching Website Flow */}
      <div className="space-y-8">
        {/* Core Product Form: Basic Info, Description, Brand, SKU, Overview, SEO */}
        <div id="product-core" className="scroll-mt-24">
          <ProductForm
            initialData={product}
            mode="edit"
            onSubmit={handleUpdate}
            isPending={updateProduct.isPending}
          />
        </div>

        {/* ── 4. Product Gallery & Media ── */}
        <section
          id="product-gallery"
          className="scroll-mt-24 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">4. Product Gallery</h3>
              <p className="text-xs text-gray-500">
                Primary catalog image and additional high-resolution gallery photos.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              <Eye className="w-3 h-3 text-emerald-600" />
              Visible on Website
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProductImageManager product={product} />
            </div>
            <div className="lg:col-span-2">
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
          </div>
        </section>

        {/* ── 5. Technical Specifications ── */}
        <div id="product-specifications" className="scroll-mt-24">
          <ProductSpecificationsEditor product={product} />
        </div>

        {/* ── 6. Related Products ── */}
        <section
          id="product-related"
          className="scroll-mt-24 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-4 gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">6. Related Products</h3>
              <p className="text-xs text-gray-500">
                Select other products from the catalog to recommend on this product&apos;s detail
                page.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              <Eye className="w-3 h-3 text-emerald-600" />
              Visible on Website
            </span>
          </div>
          <RelatedProductsSelector
            currentProductId={product.id}
            selectedProducts={product.relatedProducts || []}
            onChange={async (newRelated) => {
              await setRelatedProducts.mutateAsync(newRelated.map((p) => p.id));
            }}
            disabled={setRelatedProducts.isPending}
          />
        </section>

        {/* ── 7. Inactive / Supplementary Sections ── */}
        <section id="product-legacy" className="scroll-mt-24 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-900">
              7. Inactive / Supplementary Sections
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supplementary media and legacy content preserved in the database.
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Videos */}
            <div
              id="product-videos"
              className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Product Videos</h4>
              <p className="text-xs text-gray-500 mb-3">
                Optional video demonstrations (MP4/WebM).
              </p>
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
            <div
              id="product-documents"
              className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Technical Documents (PDF)
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Product brochures, user manuals, and technical spec sheets.
              </p>
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
        </section>
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
