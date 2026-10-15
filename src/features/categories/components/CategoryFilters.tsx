'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function CategoryFilters() {
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all') {
      router.push(pathname + '?' + createQueryString('isActive', ''));
    } else {
      router.push(pathname + '?' + createQueryString('isActive', val));
    }
  };

  const hasFilters = Boolean(localSearch || searchParams.get('isActive'));

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal className="h-4 w-4 text-[var(--color-metro-gold)]" />
        Find a category
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search categories"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>
        <div className="relative sm:w-48">
          <select
            aria-label="Filter categories by status"
            value={searchParams.get('isActive') ?? 'all'}
            onChange={handleStatusChange}
            className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push(pathname)}
            className="gap-2 text-slate-600"
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
