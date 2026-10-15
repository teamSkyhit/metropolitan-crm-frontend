'use client';

import React from 'react';
import { ProductSeo } from '../types';

interface ProductSeoSettingsProps {
  seo: ProductSeo;
  onChange: (seo: ProductSeo) => void;
  disabled?: boolean;
  errors?: { canonicalUrl?: string; ogImageUrl?: string };
}

export function ProductSeoSettings({
  seo,
  onChange,
  disabled = false,
  errors = {},
}: ProductSeoSettingsProps) {
  const metaTitle = seo.metaTitle ?? '';
  const metaDescription = seo.metaDescription ?? '';
  const metaKeywords = seo.metaKeywords ?? '';
  const canonicalUrl = seo.canonicalUrl ?? '';
  const ogImageUrl = seo.ogImageUrl ?? '';

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canonicalError =
    errors.canonicalUrl ||
    (!isValidUrl(canonicalUrl) ? 'Enter a complete URL beginning with http:// or https://.' : '');
  const ogImageError =
    errors.ogImageUrl ||
    (!isValidUrl(ogImageUrl)
      ? 'Enter a complete image URL beginning with http:// or https://.'
      : '');
  const isCanonicalValid = !canonicalError;
  const isOgImageValid = !ogImageError;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-sm font-semibold text-[#173e6e]">Search preview and sharing</h4>
        <p className="mt-1 text-xs leading-5 text-[#58708d]">
          Optimize how this product appears on Google, Bing, LinkedIn, and social media previews.
          These fields are optional; sensible defaults are generated when left blank.
        </p>
      </div>

      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="seo-meta-title" className="block text-xs font-medium text-gray-700">
              Meta title <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                metaTitle.length > 70 ? 'text-amber-600 font-semibold' : 'text-gray-400'
              }`}
            >
              {metaTitle.length} / 60–70 chars
            </span>
          </div>
          <input
            id="seo-meta-title"
            type="text"
            maxLength={70}
            disabled={disabled}
            value={metaTitle}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            placeholder="e.g. Bonfiglioli HDO Series Heavy-Duty Helical Gearbox | Metro"
            aria-describedby="seo-meta-title-help"
            className="h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 text-sm outline-none focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
          />
          <p id="seo-meta-title-help" className="mt-1.5 text-[11px] text-gray-500">
            Aim for 50–60 characters and put the product name first.
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="seo-meta-desc" className="block text-xs font-medium text-gray-700">
              Meta description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                metaDescription.length > 170 ? 'text-amber-600 font-semibold' : 'text-gray-400'
              }`}
            >
              {metaDescription.length} / 160–170 chars
            </span>
          </div>
          <textarea
            id="seo-meta-desc"
            rows={3}
            maxLength={170}
            disabled={disabled}
            value={metaDescription}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            placeholder="Engineered for harsh industrial applications with torque outputs up to 209,000 Nm. Discover technical specs and request a quote."
            aria-describedby="seo-meta-description-help"
            className="min-h-24 w-full resize-y px-3.5 py-3 text-sm"
          />
          <p id="seo-meta-description-help" className="mt-1.5 text-[11px] text-gray-500">
            Summarize the application, key advantage, and next action.
          </p>
        </div>

        {/* Meta Keywords */}
        <div>
          <label
            htmlFor="seo-meta-keywords"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Search keywords <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="seo-meta-keywords"
            type="text"
            maxLength={300}
            disabled={disabled}
            value={metaKeywords}
            onChange={(e) => onChange({ ...seo, metaKeywords: e.target.value })}
            placeholder="industrial gearbox, helical drive, high torque transmission"
            className="h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 text-sm outline-none focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
          />
        </div>

        {/* Canonical URL & OG Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="seo-canonical" className="block text-xs font-medium text-gray-700 mb-1">
              Canonical URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="seo-canonical"
              type="url"
              disabled={disabled}
              value={canonicalUrl}
              onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value })}
              placeholder="https://metropolitan.com/products/hdo-series"
              aria-invalid={!isCanonicalValid}
              aria-describedby={!isCanonicalValid ? 'seo-canonical-error' : 'seo-canonical-help'}
              className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:ring-4 focus:ring-[#102f57]/10 ${
                !isCanonicalValid ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!isCanonicalValid && (
              <p
                id="seo-canonical-error"
                className="mt-1 text-[11px] font-medium text-red-600"
                role="alert"
              >
                {canonicalError}
              </p>
            )}
            {isCanonicalValid && (
              <p id="seo-canonical-help" className="mt-1 text-[11px] text-gray-500">
                Use only when this content has another preferred public URL.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="seo-og-image" className="block text-xs font-medium text-gray-700 mb-1">
              Social sharing image URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="seo-og-image"
              type="url"
              disabled={disabled}
              value={ogImageUrl}
              onChange={(e) => onChange({ ...seo, ogImageUrl: e.target.value })}
              placeholder="https://.../og-banner.jpg"
              aria-invalid={!isOgImageValid}
              aria-describedby={!isOgImageValid ? 'seo-og-image-error' : 'seo-og-image-help'}
              className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:ring-4 focus:ring-[#102f57]/10 ${
                !isOgImageValid ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!isOgImageValid && (
              <p
                id="seo-og-image-error"
                className="mt-1 text-[11px] font-medium text-red-600"
                role="alert"
              >
                {ogImageError}
              </p>
            )}
            {isOgImageValid && (
              <p id="seo-og-image-help" className="mt-1 text-[11px] text-gray-500">
                Use a landscape image, ideally 1200 × 630 pixels.
              </p>
            )}
          </div>
        </div>

        {/* OG Image Preview */}
        {ogImageUrl && isOgImageValid && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-3">
            <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-medium text-gray-700 block">OG Image Preview</span>
              <span className="text-[10px] text-gray-500 truncate block">{ogImageUrl}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
