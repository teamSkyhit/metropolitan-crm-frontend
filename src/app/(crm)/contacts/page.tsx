'use client';

import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { useContacts, useDeleteContact } from '@/features/contacts/hooks/useContacts';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useAuthStore } from '@/features/auth/auth.store';
import { hasPermission } from '@/features/auth/permissions';
import { ContactStatus } from '@/features/contacts/types';
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
import { Modal } from '@/components/ui/modal';
import { Search, AlertCircle, Inbox, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

const CONTACT_STATUSES: ContactStatus[] = ['NEW', 'READ', 'ARCHIVED'];

function ContactsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();



  // Read state from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

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

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  const [prevSearchProp, setPrevSearchProp] = useState(search);
  if (search !== prevSearchProp) {
    setPrevSearchProp(search);
    setLocalSearch(search);
  }

  useEffect(() => {
    if (debouncedSearch !== search && debouncedSearch === localSearch) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, search, localSearch, updateUrl]);

  const { data, isLoading, isError, refetch } = useContacts({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sortBy,
    sortOrder,
  });

  const deleteContact = useDeleteContact();
  if (!user || !hasPermission(user, 'contacts:read')) {
    return (
      <div className="p-8 text-center text-red-500">
        You do not have permission to view contacts.
      </div>
    );
  }
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    updateUrl({ [key]: value, page: 1 });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    router.replace(pathname);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setErrorMsg(null);
      await deleteContact.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axErr = err as import('axios').AxiosError<{
          error?: { message?: string };
          message?: string;
        }>;
        setErrorMsg(
          axErr.response?.data?.error?.message || axErr.response?.data?.message || axErr.message
        );
      } else {
        setErrorMsg((err as Error).message || 'An error occurred');
      }
      setDeleteId(null);
    }
  };

  const selectClasses =
    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-gold)] focus:border-transparent';

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800">Failed to load contacts</h3>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">{errorMsg}</div>
      )}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search name, email, company..."
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
            {CONTACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            onClick={(e) =>
              'showPicker' in e.currentTarget && (e.currentTarget as HTMLInputElement).showPicker()
            }
            aria-label="From Date"
            title="From Date"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            onClick={(e) =>
              'showPicker' in e.currentTarget && (e.currentTarget as HTMLInputElement).showPicker()
            }
            aria-label="To Date"
            title="To Date"
            min={fromDate}
          />
        </div>

        {(search || status || fromDate || toDate) && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No contacts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      {contact.mobile && (
                        <div className="text-sm text-gray-500">{contact.mobile}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{contact.company || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={contact.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{formatDate(contact.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/contacts/${contact.id}`)}
                          className="text-[var(--color-metro-navy)]"
                          aria-label={`View contact ${contact.name}`}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {hasPermission(user, 'contacts:delete') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(contact.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            aria-label={`Delete contact ${contact.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <Button
              variant="outline"
              onClick={() => updateUrl({ page: data.meta.pagination.page - 1 }, 'push')}
              disabled={data.meta.pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => updateUrl({ page: data.meta.pagination.page + 1 }, 'push')}
              disabled={data.meta.pagination.page >= data.meta.pagination.totalPages}
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
                  disabled={data.meta.pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => updateUrl({ page: data.meta.pagination.page + 1 }, 'push')}
                  disabled={data.meta.pagination.page >= data.meta.pagination.totalPages}
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

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Contact">
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this contact? This action will archive the contact and
            it will no longer appear in active views.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending ? 'Deleting...' : 'Archive'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Manage contact submissions from the website." />
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}>
        <ContactsList />
      </Suspense>
    </div>
  );
}
