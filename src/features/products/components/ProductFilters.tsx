import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);

  const { data: brandsData } = useBrands();
  const { data: categoriesData } = useCategories();

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete('page'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('search') || '')) {
      router.push(pathname + '?' + createQueryString('search', debouncedSearch));
    }
  }, [debouncedSearch, router, pathname, createQueryString, searchParams]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search products by name or SKU..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={searchParams.get('brandId') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('brandId', e.target.value))
          }
          className="rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          aria-label="Filter by brand"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get('categoryId') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('categoryId', e.target.value))
          }
          className="rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get('status') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('status', e.target.value))
          }
          className="rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>

        <select
          value={searchParams.get('hotDeal') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('hotDeal', e.target.value))
          }
          className="rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          aria-label="Filter by Hot Deal"
        >
          <option value="">Any Hot Deal Status</option>
          <option value="true">Hot Deal Only</option>
          <option value="false">Regular Only</option>
        </select>

        <select
          value={`${searchParams.get('sortBy') || 'createdAt'}-${searchParams.get('sortOrder') || 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            const newParams = createQueryString('sortBy', sortBy);
            // manually modify the string since createQueryString works off searchParams
            const urlParams = new URLSearchParams(newParams);
            urlParams.set('sortOrder', sortOrder);
            router.push(pathname + '?' + urlParams.toString());
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
          aria-label="Sort by"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>
    </div>
  );
}
