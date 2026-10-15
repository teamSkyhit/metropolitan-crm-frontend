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
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Add brands</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm"
        >
          <option value="" disabled>
            Select a brand to add
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
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
            No brands selected. Add at least one brand for this section.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.brandIds.map((id) => {
              const brand = brands.find((b) => b.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
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
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {brand?.name || `Unknown (${id})`}
                      </div>
                      {brand?.slug && <div className="text-xs text-gray-500">/{brand.slug}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    type="button"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Remove brand"
                    aria-label="Remove brand"
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
