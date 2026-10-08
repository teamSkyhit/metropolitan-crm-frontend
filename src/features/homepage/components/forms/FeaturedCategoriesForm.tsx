import React from 'react';
import { FeaturedCategoriesContent } from '../../types';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Trash2 } from 'lucide-react';

interface Props {
  content: FeaturedCategoriesContent;
  onChange: (content: FeaturedCategoriesContent) => void;
}

export function FeaturedCategoriesForm({ content, onChange }: Props) {
  const { data: response } = useCategories({ limit: 500 });
  const categories = response?.data || [];

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id && !content.categoryIds.includes(id)) {
      onChange({ ...content, categoryIds: [...content.categoryIds, id] });
    }
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    onChange({ ...content, categoryIds: content.categoryIds.filter((cId) => cId !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--color-metro-navy)] sm:text-sm rounded-md"
        >
          <option value="" disabled>
            -- Select a category to add --
          </option>
          {categories
            .filter((c) => !content.categoryIds.includes(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Selected Categories ({content.categoryIds.length})
        </h4>
        {content.categoryIds.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No categories selected.</p>
        ) : (
          <ul className="space-y-2">
            {content.categoryIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {cat?.name || `Unknown (${id})`}
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
