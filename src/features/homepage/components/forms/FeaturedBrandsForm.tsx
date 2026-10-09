import React from 'react';
import { FeaturedBrandsContent } from '../../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { Trash2 } from 'lucide-react';

interface Props {
  content: FeaturedBrandsContent;
  onChange: (content: FeaturedBrandsContent) => void;
}

export function FeaturedBrandsForm({ content, onChange }: Props) {
  const { data: response } = useBrands({ limit: 500 });
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
                  <div className="text-sm font-medium text-gray-900">
                    {brand?.name || `Unknown (${id})`}
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-1"
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
