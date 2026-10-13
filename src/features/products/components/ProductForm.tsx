/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { CreateProductRequest, ProductSeo } from '../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductSeoSettings } from './ProductSeoSettings';
import { ProductDescriptionEditor } from './ProductDescriptionEditor';

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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = { ...formData };
    if (payload.price === null || payload.price === undefined || String(payload.price) === '') {
      payload.price = null;
    }

    if (payload.sku) payload.sku = payload.sku.trim();
    if (payload.name) payload.name = payload.name.trim();

    payload.shortDescription = payload.shortDescription?.trim() || null;
    payload.series = payload.series?.trim() || null;
    payload.overview = payload.overview?.trim() || null;
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
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
    >
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
            />
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
            />
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
              >
                <option value="">Select Brand</option>
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
              >
                <option value="">Select Category</option>
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
            />
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[var(--color-metro-navy)] focus:border-[var(--color-metro-navy)]"
          />
        </div>
      </div>

      {/* ── 2. Pricing & Visibility ── */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
          Pricing & Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
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
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="priceVisibility"
                checked={formData.priceVisibility}
                onChange={handleChange}
                disabled={isPending || readOnly}
                className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
              />
              Price Visible
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="hotDeal"
                checked={formData.hotDeal}
                onChange={handleChange}
                disabled={isPending || readOnly}
                className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
              />
              Hot Deal
            </label>
          </div>
        </div>
      </div>

      {/* ── 3. Product Overview ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Product Overview</h3>
          <p className="text-xs text-gray-500">
            Comprehensive long-form overview for technical buyers, plant engineers, and maintenance
            directors.
          </p>
        </div>
        <textarea
          id="overview"
          name="overview"
          rows={4}
          value={formData.overview || ''}
          onChange={handleChange}
          disabled={isPending || readOnly}
          placeholder="Comprehensive technical overview..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[var(--color-metro-navy)] focus:border-[var(--color-metro-navy)]"
        />
      </div>

      {/* ── 4. Detailed Description (Markdown) ── */}
      <ProductDescriptionEditor
        value={formData.description || ''}
        onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
        disabled={isPending}
        readOnly={readOnly}
      />

      {/* ── 5. SEO Settings Card ── */}
      <div className="pt-4 border-t border-gray-200">
        <ProductSeoSettings
          seo={seoData}
          onChange={handleSeoChange}
          disabled={isPending || readOnly}
        />
      </div>

      {!readOnly && (
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || brands.length === 0 || categories.length === 0}
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );
}
