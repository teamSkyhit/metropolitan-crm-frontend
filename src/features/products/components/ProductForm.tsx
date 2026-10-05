import { useState } from 'react';
import { CreateProductRequest } from '../types';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  onSubmit: (data: Partial<CreateProductRequest>) => void;
  isPending: boolean;
  mode: 'create' | 'edit';
  readOnly?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  isPending,
  mode,
  readOnly = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<CreateProductRequest>>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    brandId: initialData?.brandId || '',
    categoryId: initialData?.categoryId || '',
    description: initialData?.description || '',
    price: initialData?.price ?? null,
    priceVisibility: initialData?.priceVisibility ?? true,
    status: initialData?.status || 'DRAFT',
    hotDeal: initialData?.hotDeal ?? false,
  });

  const { data: brandsData, isLoading: isLoadingBrands } = useBrands();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: target.value === '' ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = { ...formData };
    if (payload.price === null || payload.price === undefined || String(payload.price) === '') {
      payload.price = null;
    }

    // Trim SKU and name
    if (payload.sku) payload.sku = payload.sku.trim();
    if (payload.name) payload.name = payload.name.trim();

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            value={formData.name || ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU *
          </label>
          <Input
            id="sku"
            name="sku"
            required
            maxLength={100}
            pattern="^[a-zA-Z0-9][a-zA-Z0-9._/-]*$"
            title="Alphanumeric, can contain . _ / -"
            value={formData.sku || ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
            Brand *
          </label>
          <select
            id="brandId"
            name="brandId"
            required
            value={formData.brandId || ''}
            onChange={handleChange}
            disabled={isPending || readOnly || isLoadingBrands}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={formData.categoryId || ''}
            onChange={handleChange}
            disabled={isPending || readOnly || isLoadingCategories}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (Optional)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price ?? ''}
            onChange={handleChange}
            disabled={isPending || readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'DRAFT'}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={50000}
          value={formData.description || ''}
          onChange={handleChange}
          disabled={isPending || readOnly}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
        />
      </div>

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="priceVisibility"
            checked={formData.priceVisibility}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
          />
          Price Visible
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="hotDeal"
            checked={formData.hotDeal}
            onChange={handleChange}
            disabled={isPending || readOnly}
            className="rounded border-gray-300 text-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)]"
          />
          Hot Deal
        </label>
      </div>

      {!readOnly && (
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || brands.length === 0 || categories.length === 0}
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      )}
      {!readOnly &&
        ((brands.length === 0 && !isLoadingBrands) ||
          (categories.length === 0 && !isLoadingCategories)) && (
          <p className="text-red-600 text-sm text-right mt-2">
            You must have at least one Brand and Category in the system to create a product.
          </p>
        )}
    </form>
  );
}
