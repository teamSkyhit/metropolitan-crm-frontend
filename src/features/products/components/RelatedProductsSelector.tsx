/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { RelatedProductSummary } from '@/features/products/types';
import { Search, X, ArrowUp, ArrowDown, Image as ImageIcon, Plus } from 'lucide-react';

interface RelatedProductsSelectorProps {
  currentProductId?: string;
  selectedProducts: RelatedProductSummary[];
  onChange: (products: RelatedProductSummary[]) => void;
  disabled?: boolean;
}

export function RelatedProductsSelector({
  currentProductId,
  selectedProducts,
  onChange,
  disabled = false,
}: RelatedProductsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Search query with server-side limit=20 (strictly <= 100)
  const { data: searchResults, isLoading } = useProducts({
    search: searchTerm.trim() || undefined,
    page,
    limit: 10,
  });

  const availableProducts =
    searchResults?.data?.filter((p) => {
      // Exclude current product
      if (currentProductId && p.id === currentProductId) return false;
      // Exclude already selected
      if (selectedProducts.some((sel) => sel.id === p.id)) return false;
      return true;
    }) || [];

  const handleAdd = (product: {
    id: string;
    name: string;
    slug?: string;
    sku: string;
    imageUrl?: string | null;
    price?: number | null;
    priceVisibility?: boolean;
  }) => {
    const summary: RelatedProductSummary = {
      id: product.id,
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: product.sku,
      imageUrl: product.imageUrl,
      price: product.price,
      priceVisibility: product.priceVisibility,
    };
    onChange([...selectedProducts, summary]);
  };

  const handleRemove = (id: string) => {
    onChange(selectedProducts.filter((p) => p.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedProducts.length) return;
    const updated = [...selectedProducts];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Selected Products List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Related Products ({selectedProducts.length})
        </label>
        {selectedProducts.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-md border border-gray-200">
            No related products assigned yet. Search below to add relevant products.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono">SKU: {p.sku}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === selectedProducts.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemove(p.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded ml-1"
                    aria-label="Remove related product"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Picker */}
      <div className="pt-2 border-t border-gray-200">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Find & Add Related Products
        </label>
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            disabled={disabled}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search catalog by name or SKU..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0b2e59] focus:border-[#0b2e59]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown/Grid */}
        <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100 bg-gray-50">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500">Searching products...</div>
          ) : availableProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              {searchTerm
                ? 'No matching products found.'
                : 'All available products added or no more products found.'}
            </div>
          ) : (
            availableProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">SKU: {p.sku}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAdd(p)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0b2e59] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
