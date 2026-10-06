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
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
        <select
          onChange={handleAdd}
          defaultValue=""
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--color-metro-navy)] sm:text-sm rounded-md"
        >
          <option value="" disabled>
            -- Select a product to add --
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
          <p className="text-sm text-gray-500 italic">
            No products selected yet. Select at least 1.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.productIds.map((id) => {
              const product = products.find((p) => p.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div>
                    {product ? (
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    ) : (
                      <div className="text-sm font-medium text-red-500">
                        Invalid Product ID: {id}
                      </div>
                    )}
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
