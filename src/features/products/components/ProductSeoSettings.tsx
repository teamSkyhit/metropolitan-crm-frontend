'use client';

import React from 'react';
import { ProductSeo } from '../types';

interface ProductSeoSettingsProps {
  seo: ProductSeo;
  onChange: (seo: ProductSeo) => void;
  disabled?: boolean;
}

export function ProductSeoSettings({ seo, onChange, disabled = false }: ProductSeoSettingsProps) {
  const metaTitle = seo.metaTitle ?? '';
  const metaDescription = seo.metaDescription ?? '';
  const metaKeywords = seo.metaKeywords ?? '';
  const canonicalUrl = seo.canonicalUrl ?? '';
  const ogImageUrl = seo.ogImageUrl ?? '';

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isCanonicalValid = isValidUrl(canonicalUrl);
  const isOgImageValid = isValidUrl(ogImageUrl);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Search Engine Optimization (SEO)</h4>
        <p className="text-xs text-gray-500">
          Optimize how this product appears on Google, Bing, LinkedIn, and social media previews.
        </p>
      </div>

      <div className="space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="seo-meta-title" className="block text-xs font-medium text-gray-700">
              Meta Title
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
            disabled={disabled}
            value={metaTitle}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            placeholder="e.g. Bonfiglioli HDO Series Heavy-Duty Helical Gearbox | Metro"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="seo-meta-desc" className="block text-xs font-medium text-gray-700">
              Meta Description
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
            disabled={disabled}
            value={metaDescription}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            placeholder="Engineered for harsh industrial applications with torque outputs up to 209,000 Nm. Discover technical specs and request a quote."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
          />
        </div>

        {/* Meta Keywords */}
        <div>
          <label
            htmlFor="seo-meta-keywords"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Meta Keywords
          </label>
          <input
            id="seo-meta-keywords"
            type="text"
            disabled={disabled}
            value={metaKeywords}
            onChange={(e) => onChange({ ...seo, metaKeywords: e.target.value })}
            placeholder="industrial gearbox, helical drive, high torque transmission"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
          />
        </div>

        {/* Canonical URL & OG Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="seo-canonical" className="block text-xs font-medium text-gray-700 mb-1">
              Canonical URL
            </label>
            <input
              id="seo-canonical"
              type="url"
              disabled={disabled}
              value={canonicalUrl}
              onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value })}
              placeholder="https://metropolitan.com/products/hdo-series"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-[#0b2e59] ${
                !isCanonicalValid ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!isCanonicalValid && (
              <p className="text-[11px] text-red-600 mt-1">
                Please enter a valid URL (including https://)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="seo-og-image" className="block text-xs font-medium text-gray-700 mb-1">
              OpenGraph (OG) Image URL
            </label>
            <input
              id="seo-og-image"
              type="url"
              disabled={disabled}
              value={ogImageUrl}
              onChange={(e) => onChange({ ...seo, ogImageUrl: e.target.value })}
              placeholder="https://.../og-banner.jpg"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-[#0b2e59] ${
                !isOgImageValid ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!isOgImageValid && (
              <p className="text-[11px] text-red-600 mt-1">
                Please enter a valid URL (including https://)
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

        <p className="text-[11px] text-gray-400 italic">
          Note: If SEO fields are left empty, the public website automatically generates fallbacks
          from the Product Name and Short Description.
        </p>
      </div>
    </div>
  );
}
