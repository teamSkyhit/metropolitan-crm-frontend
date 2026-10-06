/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HomepageSection,
  HomepageSectionType,
  CreateHomepageSectionRequest,
  UpdateHomepageSectionRequest,
  HomepageContent,
} from '../types';
import { useCreateHomepageSection, useUpdateHomepageSection } from '../hooks/useHomepage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeroForm } from './forms/HeroForm';
import { PromoBannerForm } from './forms/PromoBannerForm';
import { FeaturedProductsForm } from './forms/FeaturedProductsForm';
import { FeaturedCategoriesForm } from './forms/FeaturedCategoriesForm';
import { FeaturedBrandsForm } from './forms/FeaturedBrandsForm';

interface HomepageSectionFormProps {
  initialData?: HomepageSection;
}

export function HomepageSectionForm({ initialData }: HomepageSectionFormProps) {
  const router = useRouter();
  const createMutation = useCreateHomepageSection();
  const updateMutation = useUpdateHomepageSection();

  const isEdit = !!initialData;
  const [type, setType] = useState<HomepageSectionType>(
    initialData?.type ?? HomepageSectionType.HERO
  );
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Content state (type-specific)
  const [content, setContent] = useState<HomepageContent>(
    initialData?.content ?? getDefaultContent(type)
  );
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (newType: HomepageSectionType) => {
    setType(newType);
    setContent(getDefaultContent(newType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Validation
    if (type === HomepageSectionType.HERO) {
      if (!(content as any).slides || (content as any).slides.length === 0) {
        return setError('Hero section must contain at least 1 slide.');
      }
      for (const slide of (content as any).slides) {
        if (!slide.mediaId) {
          return setError('Every Hero slide must have an image selected.');
        }
      }
    }
    if (
      type === HomepageSectionType.FEATURED_PRODUCTS &&
      (!(content as any).productIds || (content as any).productIds.length === 0)
    ) {
      return setError('Featured products section must specify at least 1 product.');
    }
    if (
      type === HomepageSectionType.FEATURED_CATEGORIES &&
      (!(content as any).categoryIds || (content as any).categoryIds.length === 0)
    ) {
      return setError('Featured categories section must specify at least 1 category.');
    }
    if (
      type === HomepageSectionType.FEATURED_BRANDS &&
      (!(content as any).brandIds || (content as any).brandIds.length === 0)
    ) {
      return setError('Featured brands section must specify at least 1 brand.');
    }
    if (type === HomepageSectionType.PROMO_BANNER && !(content as any).mediaId) {
      return setError('Promo banner requires an image.');
    }

    try {
      if (isEdit) {
        // PATCH partial update: only send what changed if we wanted to be strictly minimal,
        // but since we keep full form state, we can send it all or minimal.
        // The instructions: "CRITICAL PATCH RULE: The backend supports partial PATCH semantics.
        // Only send fields the user actually changed where practical."
        const payload: UpdateHomepageSectionRequest = {};
        if (title !== (initialData.title ?? '')) payload.title = title || null;
        if (subtitle !== (initialData.subtitle ?? '')) payload.subtitle = subtitle || null;
        if (isActive !== initialData.isActive) payload.isActive = isActive;

        // For simplicity of editing content, we just send the current content.
        // Comparing deeply is complex, so we just send the content.
        payload.content = content;

        await updateMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        const payload: CreateHomepageSectionRequest = {
          type,
          title: title || null,
          subtitle: subtitle || null,
          isActive,
          content,
        };
        await createMutation.mutateAsync(payload);
      }
      router.push('/homepage');
    } catch (err: any) {
      let errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to save section';
      if (err?.response?.data?.error?.details && Array.isArray(err.response.data.error.details)) {
        const details = err.response.data.error.details.map((d: any) => d.message).join(', ');
        if (details) errMsg += ': ' + details;
      }
      setError(errMsg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
    >
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as HomepageSectionType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--color-metro-navy)] focus:border-[var(--color-metro-navy)] sm:text-sm rounded-md"
            required
          >
            <option value={HomepageSectionType.HERO}>Hero</option>
            <option value={HomepageSectionType.FEATURED_PRODUCTS}>Featured Products</option>
            <option value={HomepageSectionType.FEATURED_CATEGORIES}>Featured Categories</option>
            <option value={HomepageSectionType.FEATURED_BRANDS}>Featured Brands</option>
            <option value={HomepageSectionType.PROMO_BANNER}>Promo Banner</option>
          </select>
        </div>
      )}

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
          <div className="text-gray-900 font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
            {type.replace(/_/g, ' ')}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Featured Products"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle (Optional)
          </label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Check out our latest products"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active (Visible on homepage)
        </label>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Configuration</h3>
        {type === HomepageSectionType.HERO && (
          <HeroForm content={content as any} onChange={setContent} />
        )}
        {type === HomepageSectionType.FEATURED_PRODUCTS && (
          <FeaturedProductsForm content={content as any} onChange={setContent} />
        )}
        {type === HomepageSectionType.FEATURED_CATEGORIES && (
          <FeaturedCategoriesForm content={content as any} onChange={setContent} />
        )}
        {type === HomepageSectionType.FEATURED_BRANDS && (
          <FeaturedBrandsForm content={content as any} onChange={setContent} />
        )}
        {type === HomepageSectionType.PROMO_BANNER && (
          <PromoBannerForm content={content as any} onChange={setContent} />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/homepage')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[var(--color-metro-navy)] hover:bg-[var(--color-metro-gold)]"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
        </Button>
      </div>
    </form>
  );
}

function getDefaultContent(type: HomepageSectionType): any {
  switch (type) {
    case HomepageSectionType.HERO:
      return { slides: [] };
    case HomepageSectionType.FEATURED_PRODUCTS:
      return { productIds: [] };
    case HomepageSectionType.FEATURED_CATEGORIES:
      return { categoryIds: [] };
    case HomepageSectionType.FEATURED_BRANDS:
      return { brandIds: [] };
    case HomepageSectionType.PROMO_BANNER:
      return { heading: '', mediaId: '' };
    default:
      return {} as any;
  }
}
