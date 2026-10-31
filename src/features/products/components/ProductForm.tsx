/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { CreateProductRequest, ProductSeo } from '../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductSeoSettings } from './ProductSeoSettings';
import { AlertCircle, CheckCircle2, Package, Save, Image as ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mediaService } from '@/features/media/media.service';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { Media } from '@/features/media/types';

type FormErrors = Partial<Record<keyof CreateProductRequest, string>>;

const SKU_PATTERN = /^[a-zA-Z0-9][-a-zA-Z0-9._/]*$/;

function parseOverviewField(raw?: string | null): { text: string; imageUrl: string } {
  if (!raw) return { text: '', imageUrl: '' };
  const match = raw.match(/<!--\s*\[overview-image:\s*(.*?)\s*\]\s*-->/);
  if (match) {
    const imageUrl = match[1]?.trim() || '';
    const text = raw.replace(/<!--\s*\[overview-image:\s*.*?\s*\]\s*-->/g, '').trim();
    return { text, imageUrl };
  }
  return { text: raw, imageUrl: '' };
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

interface ProductFormProps {
  initialData?: Partial<CreateProductRequest> & {
    brand?: { id: string; name: string; logoUrl?: string | null };
    category?: { id: string; name: string; bannerUrl?: string | null; imageUrl?: string | null };
  };
  onSubmit: (data: Partial<CreateProductRequest>) => void;
  isPending: boolean;
  mode: 'create' | 'edit';
  readOnly?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  isPending,
  mode,
  readOnly = false,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateProductRequest>>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    brandId: initialData?.brandId || '',
    categoryId: initialData?.categoryId || '',
    series: initialData?.series || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    overview: initialData?.overview || '',
    price: initialData?.price ?? null,
    priceVisibility: initialData?.priceVisibility ?? true,
    status: initialData?.status || 'DRAFT',
    hotDeal: initialData?.hotDeal ?? false,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    ogImageUrl: initialData?.ogImageUrl || '',
  });

  const { data: brandsData, isLoading: isLoadingBrands } = useBrands({ limit: 100 });
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({ limit: 100 });

  const initialOverview = parseOverviewField(initialData?.overview);
  const [overviewText, setOverviewText] = useState(initialOverview.text);
  const [overviewImageUrl, setOverviewImageUrl] = useState(initialOverview.imageUrl);
  const [isUploadingOverviewImage, setIsUploadingOverviewImage] = useState(false);
  const [isOverviewMediaModalOpen, setIsOverviewMediaModalOpen] = useState(false);
  const overviewFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const parsed = parseOverviewField(initialData?.overview);
    setOverviewText(parsed.text);
    setOverviewImageUrl(parsed.imageUrl);
  }, [initialData?.overview]);

  const handleOverviewImageUpload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Overview image must be smaller than 5 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, or SVG images are supported.');
      return;
    }
    setIsUploadingOverviewImage(true);
    try {
      const uploaded = await mediaService.uploadMedia(file);
      const url = uploaded.publicUrl || (uploaded as unknown as { url?: string }).url;
      if (url) {
        setOverviewImageUrl(url);
        toast.success('Overview image uploaded successfully.');
      } else {
        toast.error('Failed to get URL for uploaded image.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload overview image.';
      toast.error(msg);
    } finally {
      setIsUploadingOverviewImage(false);
      if (overviewFileInputRef.current) overviewFileInputRef.current.value = '';
    }
  };

  const handleSelectMediaForOverview = (media: Media) => {
    const url = media.publicUrl || (media as unknown as { url?: string }).url;
    if (url) {
      setOverviewImageUrl(url);
      toast.success('Overview image selected from media library.');
    }
    setIsOverviewMediaModalOpen(false);
  };

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

  const selectedBrand = brands.find((b) => b.id === formData.brandId) || initialData?.brand;
  const selectedCategory =
    categories.find((c) => c.id === formData.categoryId) || initialData?.category;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: target.value === '' ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'overview') {
        setOverviewText(value);
      }
    }
  };

  const validate = (data: Partial<CreateProductRequest>): FormErrors => {
    const nextErrors: FormErrors = {};
    const name = data.name?.trim() || '';
    const sku = data.sku?.trim() || '';

    if (!name) nextErrors.name = 'Enter a product name.';
    else if (name.length < 2) nextErrors.name = 'Product name must be at least 2 characters.';
    else if (name.length > 200) nextErrors.name = 'Product name cannot exceed 200 characters.';

    if (!sku) nextErrors.sku = 'Enter a unique SKU.';
    else if (!SKU_PATTERN.test(sku)) {
      nextErrors.sku =
        'Use letters or numbers first; only dots, dashes, underscores, and slashes are allowed.';
    } else if (sku.length > 100) nextErrors.sku = 'SKU cannot exceed 100 characters.';

    if (!data.brandId) nextErrors.brandId = 'Select a brand.';
    if (!data.categoryId) nextErrors.categoryId = 'Select a category.';
    if (data.price != null && (!Number.isFinite(data.price) || data.price < 0)) {
      nextErrors.price = 'Enter a valid price of 0 or more.';
    }
    if (data.canonicalUrl && !isValidHttpUrl(data.canonicalUrl)) {
      nextErrors.canonicalUrl = 'Canonical URL must start with http:// or https://.';
    }
    if (data.ogImageUrl && !isValidHttpUrl(data.ogImageUrl)) {
      nextErrors.ogImageUrl = 'OpenGraph image URL must start with http:// or https://.';
    }
    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    setHasSubmitted(true);
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      window.requestAnimationFrame(() => {
        const fieldId =
          firstError === 'canonicalUrl'
            ? 'seo-canonical'
            : firstError === 'ogImageUrl'
              ? 'seo-og-image'
              : firstError;
        formRef.current?.querySelector<HTMLElement>('#' + fieldId)?.focus();
      });
      return;
    }

    const payload = { ...formData };
    if (payload.price === null || payload.price === undefined || String(payload.price) === '') {
      payload.price = null;
    }

    if (payload.sku) payload.sku = payload.sku.trim();
    if (payload.name) payload.name = payload.name.trim();

    payload.shortDescription = payload.shortDescription?.trim() || null;
    payload.series = payload.series?.trim() || null;

    const trimmedOverviewText = overviewText.trim();
    const trimmedOverviewImage = overviewImageUrl.trim();
    payload.overview = trimmedOverviewImage
      ? (trimmedOverviewText
          ? `${trimmedOverviewText}\n\n<!-- [overview-image: ${trimmedOverviewImage}] -->`
          : `<!-- [overview-image: ${trimmedOverviewImage}] -->`)
      : (trimmedOverviewText || null);
    payload.metaTitle = payload.metaTitle?.trim() || null;
    payload.metaDescription = payload.metaDescription?.trim() || null;
    payload.metaKeywords = payload.metaKeywords?.trim() || null;
    payload.canonicalUrl = payload.canonicalUrl?.trim() || null;
    payload.ogImageUrl = payload.ogImageUrl?.trim() || null;

    onSubmit(payload);
  };

  const seoData: ProductSeo = {
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    metaKeywords: formData.metaKeywords,
    canonicalUrl: formData.canonicalUrl,
    ogImageUrl: formData.ogImageUrl,
  };

  const handleSeoChange = (updatedSeo: ProductSeo) => {
    setFormData((prev) => ({
      ...prev,
      metaTitle: updatedSeo.metaTitle,
      metaDescription: updatedSeo.metaDescription,
      metaKeywords: updatedSeo.metaKeywords,
      canonicalUrl: updatedSeo.canonicalUrl,
      ogImageUrl: updatedSeo.ogImageUrl,
    }));
    setErrors((prev) => ({ ...prev, canonicalUrl: undefined, ogImageUrl: undefined }));
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const fieldClass = (field: keyof CreateProductRequest) =>
    errors[field] ? 'border-red-500 bg-red-50/40 focus:ring-red-500 focus:border-red-500' : '';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-gray-200 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-metro-navy)] text-white shadow-md ring-4 ring-[var(--color-metro-navy)]/10">
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Product details</h2>
            <p className="mt-0.5 text-xs leading-5 text-gray-500">
              Complete fields marked <span className="font-semibold text-red-600">*</span>. Optional
              details can be added now or later.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-[var(--color-metro-navy)]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-metro-navy)]" aria-hidden="true" />
          4 required fields
        </span>
      </div>

      {hasSubmitted && errorCount > 0 && (
        <div
          className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 p-4 sm:mx-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} before saving.
              </p>
              <p className="mt-0.5 text-xs text-red-700">
                The first missing or invalid field is focused automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 p-4 sm:p-6">
        {/* ── 1. Basic Product Information ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <Input
                id="name"
                name="name"
                required
                maxLength={200}
                value={formData.name || ''}
                onChange={handleChange}
                disabled={isPending || readOnly}
                placeholder="e.g. HDO Series Bevel Helical Gearbox"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : 'name-help'}
                className={fieldClass('name')}
              />
              <p id="name-help" className="text-xs text-gray-500">
                Use the customer-facing product name.
              </p>
              {errors.name && (
                <p
                  id="name-error"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU *
              </label>
              <Input
                id="sku"
                name="sku"
                required
                maxLength={100}
                pattern="^[a-zA-Z0-9][-a-zA-Z0-9._/]*$"
                title="Alphanumeric, can contain . _ / -"
                value={formData.sku || ''}
                onChange={handleChange}
                disabled={isPending || readOnly}
                placeholder="e.g. BON-HDO-100"
                aria-invalid={!!errors.sku}
                aria-describedby={errors.sku ? 'sku-error' : 'sku-help'}
                className={fieldClass('sku')}
              />
              <p id="sku-help" className="text-xs text-gray-500">
                Letters, numbers, dots, dashes, underscores and slashes only.
              </p>
              {errors.sku && (
                <p
                  id="sku-error"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.sku}
                </p>
              )}
            </div>

            {/* Brand with Logo Preview */}
            <div className="space-y-2">
              <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <div className="flex items-center gap-3">
                <select
                  id="brandId"
                  name="brandId"
                  required
                  value={formData.brandId || ''}
                  onChange={handleChange}
                  disabled={isPending || readOnly || isLoadingBrands}
                  aria-invalid={!!errors.brandId}
                  aria-describedby={errors.brandId ? 'brandId-error' : undefined}
                  className={`block h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 text-sm text-[#1e2d41] outline-none transition hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 ${fieldClass('brandId')}`}
                >
                  <option value="">{isLoadingBrands ? 'Loading brands…' : 'Select a brand'}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {selectedBrand?.logoUrl && (
                  <div
                    className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center p-1 flex-shrink-0"
                    title="Selected Brand Logo"
                  >
                    <img
                      src={selectedBrand.logoUrl}
                      alt="Brand Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              {!errors.brandId && (
                <p className="text-xs text-gray-500">
                  Controls the brand shown on the product page.
                </p>
              )}
              {errors.brandId && (
                <p
                  id="brandId-error"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.brandId}
                </p>
              )}
            </div>

            {/* Category with Banner Preview */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="flex items-center gap-3">
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  disabled={isPending || readOnly || isLoadingCategories}
                  aria-invalid={!!errors.categoryId}
                  aria-describedby={errors.categoryId ? 'categoryId-error' : undefined}
                  className={`block h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 text-sm text-[#1e2d41] outline-none transition hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 ${fieldClass('categoryId')}`}
                >
                  <option value="">
                    {isLoadingCategories ? 'Loading categories…' : 'Select a category'}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {(selectedCategory?.imageUrl || selectedCategory?.bannerUrl) && (
                  <div
                    className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0"
                    title="Selected Category Image"
                  >
                    <img
                      src={selectedCategory?.imageUrl || selectedCategory?.bannerUrl || ''}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {!errors.categoryId && (
                <p className="text-xs text-gray-500">
                  Determines where customers find this product.
                </p>
              )}
              {errors.categoryId && (
                <p
                  id="categoryId-error"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Series */}
            <div className="space-y-2">
              <label htmlFor="series" className="block text-sm font-medium text-gray-700">
                Series (Optional)
              </label>
              <Input
                id="series"
                name="series"
                maxLength={100}
                value={formData.series || ''}
                onChange={handleChange}
                disabled={isPending || readOnly}
                placeholder="e.g. HDO / HDP"
                aria-describedby="series-help"
              />
              <p id="series-help" className="text-xs text-gray-500">
                Use the manufacturer&apos;s series or range name.
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'DRAFT'}
                onChange={handleChange}
                disabled={isPending || readOnly}
                aria-describedby="status-help"
                className="block h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 text-sm text-[#1e2d41] outline-none transition hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <p id="status-help" className="text-xs text-gray-500">
                {formData.status === 'PUBLISHED'
                  ? 'Published products are visible to customers. Confirm content and media first.'
                  : 'Draft products remain hidden while you complete the content.'}
              </p>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short Description (Hero Summary)
              </label>
              <span
                className={`text-xs font-mono ${
                  (formData.shortDescription?.length || 0) > 500
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {formData.shortDescription?.length || 0} / 500 chars
              </span>
            </div>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              maxLength={500}
              value={formData.shortDescription || ''}
              onChange={handleChange}
              disabled={isPending || readOnly}
              placeholder="Hero summary displayed next to Product Name and SKU on the detail page..."
              aria-describedby="short-description-help"
              className="min-h-24 w-full resize-y rounded-xl border border-[#dce3ec] bg-white px-3.5 py-3 text-sm text-[#1e2d41] shadow-[0_1px_2px_rgba(15,38,68,0.03)] outline-none transition placeholder:text-gray-400 hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
            />
            <p id="short-description-help" className="text-xs text-gray-500">
              Write one or two customer-friendly sentences explaining what the product does.
            </p>
          </div>
        </div>

        {/* ── 2. Pricing & Visibility ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
            Pricing & Visibility
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (Optional)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price ?? ''}
                onChange={handleChange}
                disabled={isPending || readOnly}
                placeholder="Leave empty for quote inquiry"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? 'price-error' : 'price-help'}
                className={fieldClass('price')}
              />
              <p id="price-help" className="text-xs text-gray-500">
                Leave blank when customers should request a quote.
              </p>
              {errors.price && (
                <p
                  id="price-error"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.price}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                htmlFor="priceVisibility"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-3.5 transition hover:border-[#c4cfdd]"
              >
                <input
                  id="priceVisibility"
                  type="checkbox"
                  name="priceVisibility"
                  checked={formData.priceVisibility}
                  onChange={handleChange}
                  disabled={isPending || readOnly}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#34445a]">Show price</span>
                  <span className="mt-0.5 block text-xs font-normal leading-5 text-gray-500">
                    Only applies when a price is entered.
                  </span>
                </span>
              </label>

              <label
                htmlFor="hotDeal"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1e7ef] bg-[#f8fafc] p-3.5 transition hover:border-[#c4cfdd]"
              >
                <input
                  id="hotDeal"
                  type="checkbox"
                  name="hotDeal"
                  checked={formData.hotDeal}
                  onChange={handleChange}
                  disabled={isPending || readOnly}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#34445a]">
                    Mark as hot deal
                  </span>
                  <span className="mt-0.5 block text-xs font-normal leading-5 text-gray-500">
                    Highlights this product in promotions.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── 3. Product Overview ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Product Overview</h3>
            <p className="text-xs text-gray-500">
              Comprehensive long-form overview for technical buyers, plant engineers, and
              maintenance directors.
            </p>
          </div>
          <textarea
            id="overview"
            name="overview"
            rows={4}
            value={overviewText}
            onChange={(e) => {
              setOverviewText(e.target.value);
              handleChange(e);
            }}
            disabled={isPending || readOnly}
            placeholder="Comprehensive technical overview..."
            aria-label="Product overview"
            className="min-h-32 w-full resize-y rounded-xl border border-[#dce3ec] bg-white px-3.5 py-3 text-sm text-[#1e2d41] shadow-[0_1px_2px_rgba(15,38,68,0.03)] outline-none transition placeholder:text-gray-400 hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
          />

          {/* Dedicated Product Overview Image (Right-side diagram) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Overview Diagram / Right-Side Image (Optional)
                </label>
                <p className="text-[11px] text-slate-500">
                  Appears exclusively on the right side of the Product Overview section on the storefront.
                </p>
              </div>
              {overviewImageUrl && (
                <button
                  type="button"
                  disabled={isPending || readOnly}
                  onClick={() => setOverviewImageUrl('')}
                  className="inline-flex items-center gap-1 self-start sm:self-auto text-xs font-semibold text-red-600 hover:text-red-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Image
                </button>
              )}
            </div>

            {overviewImageUrl ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100/80 p-1 flex items-center justify-center">
                  <img
                    src={overviewImageUrl}
                    alt="Product Overview Diagram"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-medium text-slate-700 truncate" title={overviewImageUrl}>
                    {overviewImageUrl}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending || readOnly || isUploadingOverviewImage}
                      onClick={() => overviewFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                    >
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      Change Image
                    </button>
                    <button
                      type="button"
                      disabled={isPending || readOnly || isUploadingOverviewImage}
                      onClick={() => setIsOverviewMediaModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                      Media Library
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      No overview diagram selected
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Upload a PNG, JPG, WebP, or SVG diagram (Max 5 MB)
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isPending || readOnly || isUploadingOverviewImage}
                    onClick={() => overviewFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-metro-navy)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#153866] transition disabled:opacity-50"
                  >
                    {isUploadingOverviewImage ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Diagram
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isPending || readOnly || isUploadingOverviewImage}
                    onClick={() => setIsOverviewMediaModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                    Media Library
                  </button>
                </div>
              </div>
            )}

            <input
              ref={overviewFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleOverviewImageUpload(file);
              }}
            />
          </div>
        </div>

        {/* ── 4. SEO Settings Card ── */}
        <div className="pt-4 border-t border-gray-200">
          <ProductSeoSettings
            seo={seoData}
            onChange={handleSeoChange}
            disabled={isPending || readOnly}
            errors={{ canonicalUrl: errors.canonicalUrl, ogImageUrl: errors.ogImageUrl }}
          />
        </div>

        {!readOnly && (
          <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col gap-3 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:-mx-6 sm:-mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-500">
              {errorCount > 0
                ? `${errorCount} field ${errorCount === 1 ? 'needs' : 'need'} attention`
                : 'Your changes are checked before saving.'}
            </p>
            {(brands.length === 0 || categories.length === 0) &&
              !isLoadingBrands &&
              !isLoadingCategories && (
                <p className="text-xs font-medium text-amber-700" role="status">
                  Add at least one brand and category before saving a product.
                </p>
              )}
            <Button
              type="submit"
              disabled={isPending || brands.length === 0 || categories.length === 0}
              size="lg"
              className="gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {isOverviewMediaModalOpen && (
        <MediaSelectorModal
          isOpen={isOverviewMediaModalOpen}
          onClose={() => setIsOverviewMediaModalOpen(false)}
          onSelect={handleSelectMediaForOverview}
        />
      )}
    </form>
  );
}
