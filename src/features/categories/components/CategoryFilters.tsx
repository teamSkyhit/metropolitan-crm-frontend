
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
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

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search categories..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <select
          defaultValue={searchParams.get('isActive') ?? 'all'}
          onChange={handleStatusChange}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>
  );
}
