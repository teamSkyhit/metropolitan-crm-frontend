import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useCategories } from '@/features/categories/hooks/useCategories';

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchParam);
  const debouncedSearch = useDebounce(localSearch, 500);

  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setLocalSearch(searchParam);
  }

  const { data: brandsData } = useBrands({ limit: 100 });
  const { data: categoriesData } = useCategories({ limit: 100 });

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
    if (debouncedSearch !== searchParam && debouncedSearch === localSearch) {
      router.push(pathname + '?' + createQueryString('search', debouncedSearch));
    }
  }, [debouncedSearch, localSearch, searchParam, router, pathname, createQueryString]);

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
          className="block w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={searchParams.get('brandId') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('brandId', e.target.value))
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="PUBLISHED">Active</option>
          <option value="DRAFT">Draft</option>
        </select>

        <select
          value={searchParams.get('hotDeal') || ''}
          onChange={(e) =>
            router.push(pathname + '?' + createQueryString('hotDeal', e.target.value))
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
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
