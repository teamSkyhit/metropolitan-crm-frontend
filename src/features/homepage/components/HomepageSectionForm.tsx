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
import {
  useCreateHomepageSection,
  useUpdateHomepageSection,
  useHomepageSections,
} from '../hooks/useHomepage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Package,
  FolderTree,
  Award,
  Megaphone,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
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
  const { data: allSections } = useHomepageSections();

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

  // Single-instance active sections in backend: HERO, FEATURED_PRODUCTS, FEATURED_CATEGORIES, FEATURED_BRANDS
  const isSingleInstanceType = (
    [
      HomepageSectionType.HERO,
      HomepageSectionType.FEATURED_PRODUCTS,
      HomepageSectionType.FEATURED_CATEGORIES,
      HomepageSectionType.FEATURED_BRANDS,
    ] as HomepageSectionType[]
  ).includes(type);

  const existingActiveSection = allSections?.find(
    (s) => s.type === type && s.isActive && (!isEdit || s.id !== initialData?.id)
  );

  const hasActiveConflict = isSingleInstanceType && isActive && !!existingActiveSection;

  const handleTypeChange = (newType: HomepageSectionType) => {
    setType(newType);
    setContent(getDefaultContent(newType));
    setError(null);

    // If an active section of this type already exists, default isActive to false so user doesn't hit a constraint error
    const activeExists = allSections?.some((s) => s.type === newType && s.isActive);
    if (activeExists && !isEdit) {
      setIsActive(false);
    } else if (!activeExists && !isEdit) {
      setIsActive(true);
    }
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

      {hasActiveConflict && !error && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                An active {type.replace(/_/g, ' ')} section already exists.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                The homepage only allows one active {type.replace(/_/g, ' ')} section at a time. You
                can save this as an inactive draft, or edit the existing section instead.
              </p>
            </div>
          </div>
          {existingActiveSection && (
            <Link
              href={`/homepage/${existingActiveSection.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-xs whitespace-nowrap transition-colors"
            >
              <span>Edit Existing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {!isEdit ? (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Section Type <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Choose what kind of homepage section you want to build:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                id: HomepageSectionType.HERO,
                label: 'Hero Carousel',
                desc: 'Rotating banner slides with background images and CTA buttons',
                icon: Layers,
              },
              {
                id: HomepageSectionType.FEATURED_PRODUCTS,
                label: 'Featured Products',
                desc: 'Showcase selected catalog products on the homepage',
                icon: Package,
              },
              {
                id: HomepageSectionType.FEATURED_CATEGORIES,
                label: 'Featured Categories',
                desc: 'Highlight main product categories with banners',
                icon: FolderTree,
              },
              {
                id: HomepageSectionType.FEATURED_BRANDS,
                label: 'Featured Brands',
                desc: 'Display partner brands and manufacturer logos',
                icon: Award,
              },
              {
                id: HomepageSectionType.PROMO_BANNER,
                label: 'Promo Banner',
                desc: 'Full-width promotional callout banner with image & CTA',
                icon: Megaphone,
              },
            ].map((option) => {
              const isSelected = type === option.id;
              const IconComp = option.icon;
              const isOptionActiveInDb = allSections?.some(
                (s) => s.type === option.id && s.isActive
              );

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleTypeChange(option.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--color-metro-navy)] bg-blue-50/50 shadow-sm ring-1 ring-[var(--color-metro-navy)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-[var(--color-metro-navy)] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isOptionActiveInDb && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                          Active Exists
                        </span>
                      )}
                      {isSelected && (
                        <span className="flex h-2 w-2 rounded-full bg-[var(--color-metro-navy)]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        isSelected ? 'text-[var(--color-metro-navy)]' : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {option.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">Section Type</label>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[var(--color-metro-navy)] font-bold text-sm">
            <Layers className="w-4 h-4" />
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
