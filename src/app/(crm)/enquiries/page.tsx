'use client';

import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { useEnquiries } from '@/features/enquiries/hooks/useEnquiries';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { ENQUIRY_STATUSES } from '@/features/enquiries/types';
import { useUsers } from '@/features/users/hooks/useUsers';
import { ROLES } from '@/lib/constants/roles';
import { useAuthStore } from '@/features/auth/auth.store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  AlertCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

function EnquiriesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const assignedTo = searchParams.get('assignedTo') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const updateUrl = useCallback(
    (
      updates: Record<string, string | number | undefined>,
      action: 'push' | 'replace' = 'replace'
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const newUrl = `${pathname}?${params.toString()}`;
      if (action === 'push') {
        router.push(newUrl);
      } else {
        router.replace(newUrl);
      }
    },
    [searchParams, pathname, router]
  );

  // Local state for immediate input (search)
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Sync local state when URL search changes (e.g. back/forward navigation)
  const [prevSearchProp, setPrevSearchProp] = useState(search);
  if (search !== prevSearchProp) {
    setPrevSearchProp(search);
    setLocalSearch(search);
  }

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== search && debouncedSearch === localSearch) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, search, localSearch, updateUrl]);

  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isCrmUser = role === ROLES.CRM_USER;
  const canAssign = !isCrmUser;

  // When CRM_USER is logged in, restrict query strictly to enquiries assigned to them
  const effectiveAssignedTo = isCrmUser ? user?.id : assignedTo || undefined;

  const { data: usersData } = useUsers({ limit: 100 }, { enabled: canAssign });
  const { data, isLoading, isError, refetch } = useEnquiries(
    {
      page,
      limit: 20,
      search: search || undefined,
      status: status || undefined,
      assignedTo: effectiveAssignedTo,
      from: from || undefined,
      to: to || undefined,
    },
    { enabled: !isCrmUser || Boolean(user?.id) }
  );

  // Client-side defense-in-depth filter: ensure CRM_USER strictly only sees their assigned leads
  const rawList = data?.data || [];
  const enquiriesList =
    isCrmUser && user?.id ? rawList.filter((enq) => enq.assignedTo?.id === user.id) : rawList;

  const handleFilterChange = (key: string, value: string) => {
    updateUrl({ [key]: value, page: 1 });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    router.replace(pathname);
  };

  const selectClasses =
    'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800">Failed to load enquiries</h3>
        <p className="text-sm text-red-600 mt-2 mb-4">
          There was an error communicating with the server.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-[var(--color-metro-gold)]" /> Search and
            filters
          </div>
          {(search || status || (canAssign && assignedTo) || from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1.5 text-slate-600"
            >
              <X className="h-4 w-4" /> Clear all
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search ID, name, company..."
              aria-label="Search enquiries"
              className="pl-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={selectClasses}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>

          {canAssign && (
            <select
              value={assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className={selectClasses}
              aria-label="Filter by assignee"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {usersData?.data?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          <Input
            type="date"
            value={from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
            aria-label="From Date"
            title="From Date"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
            aria-label="To Date"
            title="To Date"
            min={from}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : !data || enquiriesList.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">
              {isCrmUser ? 'No assigned enquiries found' : 'No enquiries match your filters'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isCrmUser
                ? 'Enquiries assigned to you will appear here once allocated by an administrator.'
                : 'Clear filters or broaden the date range to see more results.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer / Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiriesList.map((enq) => (
                  <TableRow key={enq.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{enq.name}</div>
                      {enq.company && <div className="text-sm text-gray-500">{enq.company}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{enq.email}</div>
                      <div className="text-sm text-gray-500">{enq.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={enq.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {enq.assignedTo ? enq.assignedTo.name : 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {enq.lineItemCount} {enq.lineItemCount === 1 ? 'item' : 'items'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(enq.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`${ROUTES.ENQUIRIES}/${enq.id}`)}
                        className="text-[var(--color-metro-navy)] font-medium hover:text-[var(--color-metro-navy)]/80 hover:bg-gray-100"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <Button
              variant="outline"
              onClick={() => updateUrl({ page: data.meta.pagination.page - 1 }, 'push')}
              disabled={!data.meta.pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => updateUrl({ page: data.meta.pagination.page + 1 }, 'push')}
              disabled={!data.meta.pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{data.meta.pagination.page}</span> of{' '}
                <span className="font-medium">{data.meta.pagination.totalPages}</span> (
                <span className="font-medium">{data.meta.pagination.total}</span> total results)
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => updateUrl({ page: data.meta.pagination.page - 1 }, 'push')}
                  disabled={!data.meta.pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => updateUrl({ page: data.meta.pagination.page + 1 }, 'push')}
                  disabled={!data.meta.pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnquiriesPage() {
  const role = useAuthStore((state) => state.role);
  const isCrmUser = role === ROLES.CRM_USER;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCrmUser ? 'My Assigned Enquiries' : 'Enquiries'}
        description={
          isCrmUser
            ? 'Review and manage customer enquiries assigned to you, record notes, and track follow-ups.'
            : 'Review customer requests, assign ownership, and track every follow-up.'
        }
      />
      <Suspense
        fallback={
          <div
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            aria-label="Loading enquiries"
          />
        }
      >
        <EnquiriesList />
      </Suspense>
    </div>
  );
}
