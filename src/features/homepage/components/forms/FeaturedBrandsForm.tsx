/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { FeaturedBrandsContent } from '../../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { Trash2 } from 'lucide-react';

interface Props {
  content: FeaturedBrandsContent;
  onChange: (content: FeaturedBrandsContent) => void;
}

export function FeaturedBrandsForm({ content, onChange }: Props) {
  const { data: response } = useBrands({ limit: 100 });
  const brands = response?.data || [];

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id && !content.brandIds.includes(id)) {
      onChange({ ...content, brandIds: [...content.brandIds, id] });
    }
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    onChange({ ...content, brandIds: content.brandIds.filter((bId) => bId !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Brand</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--color-metro-navy)] sm:text-sm rounded-md"
        >
          <option value="" disabled>
            -- Select a brand to add --
          </option>
          {brands
            .filter((b) => !content.brandIds.includes(b.id))
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Selected Brands ({content.brandIds.length})
        </h4>
        {content.brandIds.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No brands selected.</p>
        ) : (
          <ul className="space-y-2">
            {content.brandIds.map((id) => {
              const brand = brands.find((b) => b.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    {brand?.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt=""
                        className="w-8 h-8 object-contain rounded border border-gray-200 bg-white p-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        No logo
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {brand?.name || `Unknown (${id})`}
                      </div>
                      {brand?.slug && <div className="text-xs text-gray-500">/{brand.slug}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
