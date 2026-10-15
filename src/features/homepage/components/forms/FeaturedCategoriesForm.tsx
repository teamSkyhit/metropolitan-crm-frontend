/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { FeaturedCategoriesContent } from '../../types';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Trash2 } from 'lucide-react';

interface Props {
  content: FeaturedCategoriesContent;
  onChange: (content: FeaturedCategoriesContent) => void;
}

export function FeaturedCategoriesForm({ content, onChange }: Props) {
  const { data: response } = useCategories({ limit: 100 });
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
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Add categories</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm"
        >
          <option value="" disabled>
            Select a category to add
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
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
            No categories selected. Add at least one category for this section.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.categoryIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {cat?.bannerUrl ? (
                      <img
                        src={cat.bannerUrl}
                        alt=""
                        className="w-12 h-8 object-cover rounded border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-12 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        No banner
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {cat?.name || `Unknown (${id})`}
                      </div>
                      {cat?.slug && <div className="text-xs text-gray-500">/{cat.slug}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    type="button"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Remove category"
                    aria-label="Remove category"
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
