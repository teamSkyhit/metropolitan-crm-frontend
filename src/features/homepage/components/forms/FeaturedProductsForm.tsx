/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { FeaturedProductsContent } from '../../types';
import { useProducts } from '@/features/products/hooks/useProducts';
import { Trash2 } from 'lucide-react';

interface Props {
  content: FeaturedProductsContent;
  onChange: (content: FeaturedProductsContent) => void;
}

export function FeaturedProductsForm({ content, onChange }: Props) {
  const { data: response } = useProducts({ limit: 100 });
  const products = response?.data || [];

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id && !content.productIds.includes(id)) {
      onChange({ ...content, productIds: [...content.productIds, id] });
    }
    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    onChange({ ...content, productIds: content.productIds.filter((pId) => pId !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Add products</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm"
        >
          <option value="" disabled>
            Select a product to add
          </option>
          {products
            .filter((p) => !content.productIds.includes(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku})
              </option>
            ))}
        </select>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Selected Products ({content.productIds.length})
        </h4>
        {content.productIds.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
            No products selected. Add at least one product for this section.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.productIds.map((id) => {
              const product = products.find((p) => p.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-10 h-10 object-cover rounded border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      {product ? (
                        <>
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-red-500">
                          Invalid Product ID: {id}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    type="button"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remove product"
                    title="Remove product"
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
