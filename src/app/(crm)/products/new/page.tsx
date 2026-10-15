'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { ProductForm } from '@/features/products/components/ProductForm';
import { ProductGalleryManager } from '@/features/products/components/ProductGalleryManager';
import { ProductVideoManager } from '@/features/products/components/ProductVideoManager';
import { ProductDocumentManager } from '@/features/products/components/ProductDocumentManager';
import { ProductFeaturesEditor } from '@/features/products/components/ProductFeaturesEditor';
import { ProductKeyBenefitsEditor } from '@/features/products/components/ProductKeyBenefitsEditor';
import { RelatedProductsSelector } from '@/features/products/components/RelatedProductsSelector';
import { ProductSpecificationsEditor } from '@/features/products/components/ProductSpecificationsEditor';
import {
  CreateProductRequest,
  ProductFeature,
  ProductKeyBenefit,
  RelatedProductSummary,
  ProductSpecification,
} from '@/features/products/types';
import { useCreateProduct } from '@/features/products/hooks/useProduct';
import { productsService } from '@/features/products/products.service';
import { useRouter } from 'next/navigation';
function getErrorMessage(err: unknown, defaultMsg: string): string {
  const errorObj = err as {
    response?: {
      data?: {
        error?: {
          message?: string;
          details?: Array<{ field?: string; message?: string; code?: string }>;
        };
        message?: string;
      };
    };
    message?: string;
  };
  const errorData = errorObj?.response?.data?.error;
  if (errorData?.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
    const detailMsgs = errorData.details
      .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
      .filter(Boolean)
      .join('; ');
    return `${errorData.message || 'Validation failed'} — ${detailMsgs}`;
  }
  return errorData?.message || errorObj?.response?.data?.message || errorObj?.message || defaultMsg;
}

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  // Subresource states prepared before creation
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [benefits, setBenefits] = useState<ProductKeyBenefit[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductSummary[]>([]);
  const [localGalleryFiles, setLocalGalleryFiles] = useState<File[]>([]);
  const [localVideos, setLocalVideos] = useState<{ file: File; title: string }[]>([]);
  const [localDocuments, setLocalDocuments] = useState<{ file: File; title: string }[]>([]);

  // Orchestration state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orchestrationStatus, setOrchestrationStatus] = useState<{
    step: string;
    subresourceErrors: string[];
    createdProductId?: string;
  } | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const handleSubmit = async (coreData: Partial<CreateProductRequest>) => {
    setFatalError(null);

    const specificationsToSave = specifications
      .filter((spec) => spec.key.trim() || spec.value.trim() || spec.unit?.trim())
      .map((spec) => ({
        key: spec.key.trim(),
        value: spec.value.trim(),
        unit: spec.unit?.trim() || '',
      }));
    const incompleteSpecification = specificationsToSave.some((spec) => !spec.key || !spec.value);
    const specificationKeys = specificationsToSave.map((spec) => spec.key.toLowerCase());
    const hasDuplicateSpecification = new Set(specificationKeys).size !== specificationKeys.length;

    if (incompleteSpecification || hasDuplicateSpecification) {
      setFatalError(
        incompleteSpecification
          ? 'Complete both the name and value for every specification, or remove the unfinished row.'
          : 'Each specification name must be unique. Remove or rename the duplicate row.'
      );
      document.getElementById('product-specifications')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setIsSubmitting(true);
    setOrchestrationStatus({ step: 'Creating core product record...', subresourceErrors: [] });

    let newProductId: string | undefined;
    const subresourceErrors: string[] = [];

    // STEP 1: Create Core Product Record
    try {
      const res = await createProduct.mutateAsync(coreData as CreateProductRequest);
      newProductId = res.data.id;
    } catch (err: unknown) {
      // If backend has strict validation rejecting unmigrated columns (e.g. older develop branch),
      // fallback to creating core record with base fields and warn operator.
      const errorObj = err as {
        response?: {
          data?: {
            error?: {
              details?: Array<{ field?: string; message?: string; code?: string }>;
            };
          };
        };
      };
      const errDetails = errorObj?.response?.data?.error?.details;
      const hasUnrecognizedKeys =
        Array.isArray(errDetails) && errDetails.some((d) => d.code === 'unrecognized_keys');

      if (hasUnrecognizedKeys) {
        try {
          const baseCoreData: CreateProductRequest = {
            name: coreData.name!,
            sku: coreData.sku!,
            brandId: coreData.brandId!,
            categoryId: coreData.categoryId!,
            description: coreData.description ?? null,
            price: coreData.price ?? null,
            priceVisibility: coreData.priceVisibility ?? true,
            status: coreData.status ?? 'DRAFT',
            hotDeal: coreData.hotDeal ?? false,
          };
          const fallbackRes = await createProduct.mutateAsync(baseCoreData);
          newProductId = fallbackRes.data.id;
          subresourceErrors.push(
            'Core product created, but extended attributes (series, short description, SEO) were skipped because the active backend branch has not applied feat/product-gallery-documents-category-media migrations.'
          );
        } catch (fallbackErr: unknown) {
          const msg = getErrorMessage(fallbackErr, 'Failed to create product record.');
          setFatalError(msg);
          setIsSubmitting(false);
          setOrchestrationStatus(null);
          return;
        }
      } else {
        const msg = getErrorMessage(err, 'Failed to create product record.');
        setFatalError(msg);
        setIsSubmitting(false);
        setOrchestrationStatus(null);
        return;
      }
    }

    // STEP 2: Save Specifications if provided
    if (specificationsToSave.length > 0) {
      setOrchestrationStatus({
        step: 'Saving product specifications...',
        subresourceErrors,
        createdProductId: newProductId,
      });
      try {
        await productsService.updateProductSpecifications(newProductId, {
          specifications: specificationsToSave,
        });
      } catch (err: unknown) {
        subresourceErrors.push(`Specifications: ${getErrorMessage(err, 'Failed to save')}`);
      }
    }

    // STEP 3: Save Features
    if (features.length > 0) {
      setOrchestrationStatus({
        step: `Saving ${features.length} product feature(s)...`,
        subresourceErrors,
        createdProductId: newProductId,
      });
      for (const feat of features) {
        try {
          await productsService.addProductFeature(newProductId, {
            icon: feat.icon,
            title: feat.title,
            description: feat.description,
            sortOrder: feat.sortOrder,
          });
        } catch (err: unknown) {
          subresourceErrors.push(
            `Feature "${feat.title}": ${getErrorMessage(err, 'Failed to save')}`
          );
        }
      }
    }

    // STEP 4: Save Key Benefits
    if (benefits.length > 0) {
      setOrchestrationStatus({
        step: `Saving ${benefits.length} key benefit(s)...`,
        subresourceErrors,
        createdProductId: newProductId,
      });
      for (const ben of benefits) {
        try {
          await productsService.addProductKeyBenefit(newProductId, {
            icon: ben.icon,
            title: ben.title,
            description: ben.description,
            sortOrder: ben.sortOrder,
          });
        } catch (err: unknown) {
          subresourceErrors.push(
            `Benefit "${ben.title}": ${getErrorMessage(err, 'Failed to save')}`
          );
        }
      }
    }

    // STEP 5: Assign Related Products
    if (relatedProducts.length > 0) {
      setOrchestrationStatus({
        step: 'Assigning related products...',
        subresourceErrors,
        createdProductId: newProductId,
      });
      try {
        await productsService.setRelatedProducts(
          newProductId,
          relatedProducts.map((p) => p.id)
        );
      } catch (err: unknown) {
        subresourceErrors.push(`Related Products: ${getErrorMessage(err, 'Failed to assign')}`);
      }
    }

    // STEP 6: Upload Gallery Images
    if (localGalleryFiles.length > 0) {
      setOrchestrationStatus({
        step: `Uploading ${localGalleryFiles.length} gallery image(s)...`,
        subresourceErrors,
        createdProductId: newProductId,
      });
      try {
        await productsService.uploadProductGallery(newProductId, localGalleryFiles);
      } catch (err: unknown) {
        subresourceErrors.push(`Gallery: ${getErrorMessage(err, 'Failed to upload images')}`);
      }
    }

    // STEP 7: Upload Videos
    if (localVideos.length > 0) {
      setOrchestrationStatus({
        step: `Uploading ${localVideos.length} product video(s)...`,
        subresourceErrors,
        createdProductId: newProductId,
      });
      for (const v of localVideos) {
        try {
          await productsService.uploadProductVideos(newProductId, [v.file], v.title);
        } catch (err: unknown) {
          subresourceErrors.push(`Video "${v.title}": ${getErrorMessage(err, 'Failed to upload')}`);
        }
      }
    }

    // STEP 8: Upload Documents (PDFs)
    if (localDocuments.length > 0) {
      setOrchestrationStatus({
        step: `Uploading ${localDocuments.length} technical PDF(s)...`,
        subresourceErrors,
        createdProductId: newProductId,
      });
      for (const d of localDocuments) {
        try {
          await productsService.uploadProductDocuments(newProductId, [d.file], d.title);
        } catch (err: unknown) {
          subresourceErrors.push(
            `Document "${d.title}": ${getErrorMessage(err, 'Failed to upload')}`
          );
        }
      }
    }

    setIsSubmitting(false);

    // Partial Failure or Full Success Navigation
    if (subresourceErrors.length > 0) {
      setOrchestrationStatus({
        step: 'Product created with partial warnings',
        subresourceErrors,
        createdProductId: newProductId,
      });
    } else {
      router.push(`${ROUTES.PRODUCTS}/${newProductId}`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Unified Compact Action Header Bar */}
      <div className="sticky top-0 z-30 -mx-3 -mt-4 mb-4 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-xs backdrop-blur-md min-[380px]:-mx-4 sm:-mx-6 sm:-mt-5 sm:px-6 md:-mx-8 md:-mt-7 md:px-8 xl:-mx-10 xl:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Button, Title & Status */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={ROUTES.PRODUCTS}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Back to Products"
              title="Back to Products list"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  Create Product
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Draft
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block leading-tight">
                Catalog content, specs & gallery
              </p>
            </div>
          </div>

          {/* Center: Jump To Navigation Tabs (occupies the center space) */}
          <nav
            aria-label="Product form sections"
            className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none order-3 w-full lg:order-2 lg:w-auto lg:flex-1 lg:justify-center"
          >
            {[
              ['#product-core', 'Basic Details'],
              ['#product-specifications', 'Specifications'],
              ['#product-features', 'Features'],
              ['#product-benefits', 'Benefits'],
              ['#product-media', 'Media Gallery'],
              ['#product-videos', 'Videos'],
              ['#product-documents', 'Documents'],
              ['#product-related', 'Related Products'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-lg border border-slate-200/60 bg-slate-50/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 order-2 lg:order-3">
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </Link>

            <Button
              type="submit"
              form="product-core-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-metro-navy)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Create Product</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fatal Error Banner */}
      {fatalError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Failed to create product</h4>
            <p className="text-xs text-red-600 mt-0.5">{fatalError}</p>
          </div>
        </div>
      )}

      {/* Orchestration Status / Partial Failure Banner */}
      {orchestrationStatus && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            orchestrationStatus.subresourceErrors.length > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
          ) : orchestrationStatus.subresourceErrors.length > 0 ? (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h4 className="text-sm font-semibold">
              {isSubmitting
                ? orchestrationStatus.step
                : orchestrationStatus.subresourceErrors.length > 0
                  ? 'Product was created, but some additional content could not be saved.'
                  : 'Product and all content created successfully!'}
            </h4>

            {orchestrationStatus.subresourceErrors.length > 0 && (
              <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                {orchestrationStatus.subresourceErrors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}

            {orchestrationStatus.createdProductId && (
              <div className="mt-3">
                <Link
                  href={`${ROUTES.PRODUCTS}/${orchestrationStatus.createdProductId}`}
                  className="inline-flex items-center px-3 py-1.5 bg-[#0b2e59] text-white text-xs font-medium rounded-md hover:bg-[#0b2e59]/90 transition-colors"
                >
                  Open Edit Product to Retry
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form & Subresources Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Core Info & Content Sections */}
        <div className="space-y-6 xl:col-span-2">
          <div id="product-core" className="scroll-mt-24">
            <ProductForm mode="create" onSubmit={handleSubmit} isPending={isSubmitting} />
          </div>

          {/* Specifications Card */}
          <ProductSpecificationsEditor
            value={specifications}
            onChange={setSpecifications}
            disabled={isSubmitting}
          />

          {/* Features Card */}
          <div
            id="product-features"
            className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
          >
            <ProductFeaturesEditor
              features={features}
              onChange={setFeatures}
              disabled={isSubmitting}
            />
          </div>

          {/* Key Benefits Card */}
          <div
            id="product-benefits"
            className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
          >
            <ProductKeyBenefitsEditor
              benefits={benefits}
              onChange={setBenefits}
              disabled={isSubmitting}
            />
          </div>

          {/* Related Products Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Related Products</h4>
            <p className="text-xs text-gray-500 mb-4">
              Select other products from the catalog to recommend on this product&apos;s detail
              page.
            </p>
            <RelatedProductsSelector
              selectedProducts={relatedProducts}
              onChange={setRelatedProducts}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column: Media Subresources */}
        <div id="product-media" className="scroll-mt-24 space-y-6">
          {/* Gallery Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductGalleryManager
              gallery={[]}
              localFiles={localGalleryFiles}
              onLocalFilesChange={setLocalGalleryFiles}
              disabled={isSubmitting}
            />
          </div>

          {/* Videos Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductVideoManager
              videos={[]}
              localFiles={localVideos}
              onLocalFilesChange={setLocalVideos}
              disabled={isSubmitting}
            />
          </div>

          {/* Documents Card */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
            <ProductDocumentManager
              documents={[]}
              localFiles={localDocuments}
              onLocalFilesChange={setLocalDocuments}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
