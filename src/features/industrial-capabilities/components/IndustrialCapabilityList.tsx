/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Edit2,
  Trash2,
  LoaderCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Search,
  Factory,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useIndustrialCapabilities,
  useDeleteIndustrialCapability,
  useRestoreIndustrialCapability,
  useReorderIndustrialCapabilities,
  useUpdateIndustrialCapability,
} from '../hooks/useIndustrialCapabilities';
import { ProductContentIcon } from '@/components/ui/icon-picker/ProductContentIcon';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/lib/constants/routes';

export function IndustrialCapabilityList() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = {
    search: search.trim() || undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'true',
  };

  const { data: response, isLoading } = useIndustrialCapabilities(queryParams);
  const { mutate: deleteCapability, isPending: isDeleting } = useDeleteIndustrialCapability();
  const { mutate: restoreCapability } = useRestoreIndustrialCapability();
  const { mutate: reorderCapabilities, isPending: isReordering } =
    useReorderIndustrialCapabilities();
  const { mutate: updateCapability } = useUpdateIndustrialCapability();

  const capabilities = response?.data || [];

  const handleConfirmDelete = () => {
    if (deleteId) {
      const idToRestore = deleteId;
      deleteCapability(deleteId, {
        onSuccess: () => {
          toast.success(
            (t) => (
              <span className="flex items-center gap-2">
                Capability deleted.
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(t.id);
                    restoreCapability(idToRestore, {
                      onSuccess: () => toast.success('Capability restored'),
                      onError: () => toast.error('Failed to restore capability'),
                    });
                  }}
                  className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Undo
                </button>
              </span>
            ),
            { duration: 6000 }
          );
          setDeleteId(null);
        },
        onError: () => {
          toast.error('Failed to delete capability');
        },
      });
    }
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateCapability(
      { id, payload: { isActive: !currentActive } },
      {
        onSuccess: () => {
          toast.success(`Capability ${!currentActive ? 'activated' : 'deactivated'}`);
        },
        onError: () => {
          toast.error('Failed to update status');
        },
      }
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= capabilities.length) return;

    const newOrder = [...capabilities];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const ids = newOrder.map((c) => c.id);
    reorderCapabilities(ids, {
      onSuccess: () => {
        toast.success('Order updated successfully');
      },
      onError: () => {
        toast.error('Failed to update order');
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 shadow-2xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition hover:border-slate-300 focus:border-[var(--color-metro-navy)]"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        <Link
          href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/new`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-metro-navy)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#153866]"
        >
          <Plus size={14} />
          Add Capability
        </Link>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Capability"
        message="Are you sure you want to delete this industrial capability? It can be restored later."
        confirmLabel="Delete Capability"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Loading State */}
      {isLoading ? (
        <div
          role="status"
          className="flex min-h-56 items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-xs"
        >
          <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-metro-navy)]" />
          Loading capabilities...
        </div>
      ) : capabilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/80">
            <Factory className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No industrial capabilities found</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {search || activeFilter !== 'all'
              ? 'No capabilities match your search criteria. Try clearing filters.'
              : 'Add your first core capability segment to highlight specialized manufacturing capacity.'}
          </p>
          <Link
            href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/new`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-metro-navy)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#153866]"
          >
            <Plus size={14} />
            Create Capability
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Mobile Card Layout */}
          <div className="divide-y divide-slate-100 md:hidden">
            {capabilities.map((cap, index) => (
              <div key={cap.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {cap.imageUrl ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                      <img
                        src={cap.imageUrl}
                        alt={cap.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                      <Factory size={22} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {cap.number && (
                        <span className="font-mono text-xs font-bold text-[var(--color-metro-gold)]">
                          {cap.number}
                        </span>
                      )}
                      <Link
                        href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/${cap.id}`}
                        className="font-bold text-slate-900 truncate hover:text-[var(--color-metro-navy)]"
                      >
                        {cap.title}
                      </Link>
                      {cap.icon && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[var(--color-metro-navy)]">
                          <ProductContentIcon icon={cap.icon} size={13} />
                        </span>
                      )}
                    </div>
                    {cap.shortDescription && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {cap.shortDescription}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                      {cap.typicalProducts?.length || 0} typical products
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(cap.id, cap.isActive)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                      cap.isActive
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        cap.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {cap.isActive ? 'Active' : 'Draft'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Order:</span>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-600">
                      {cap.sortOrder}
                    </span>
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMove(index, 'up')}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                        title="Move Up"
                        aria-label="Move capability up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === capabilities.length - 1 || isReordering}
                        onClick={() => handleMove(index, 'down')}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                        title="Move Down"
                        aria-label="Move capability down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/${cap.id}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-[var(--color-metro-navy)]"
                      title="Edit Capability"
                      aria-label="Edit capability"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteId(cap.id)}
                      disabled={isDeleting}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Delete Capability"
                      aria-label="Delete capability"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/75">
                  <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                    No.
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Capability
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Icon
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Products
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sort Order
                  </TableHead>
                  <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capabilities.map((cap, index) => (
                  <TableRow
                    key={cap.id}
                    className="group border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    <TableCell className="py-3.5 pl-6">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {cap.number || '—'}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3.5">
                        {cap.imageUrl ? (
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                            <img
                              src={cap.imageUrl}
                              alt={cap.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                            <Factory size={18} />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/${cap.id}`}
                            className="font-bold text-slate-900 transition hover:text-[var(--color-metro-navy)]"
                          >
                            {cap.title}
                          </Link>
                          {cap.shortDescription && (
                            <p className="max-w-xs truncate text-xs text-slate-400">
                              {cap.shortDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      {cap.icon ? (
                        <div className="flex items-center gap-1.5" title={cap.icon}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[var(--color-metro-navy)]">
                            <ProductContentIcon icon={cap.icon} size={15} />
                          </div>
                          <span className="font-mono text-xs text-slate-500 capitalize">
                            {cap.icon}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {cap.typicalProducts?.length || 0} items
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cap.id, cap.isActive)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          cap.isActive
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Click to toggle active status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cap.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {cap.isActive ? 'Active' : 'Draft'}
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-600">
                          {cap.sortOrder}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0 || isReordering}
                            onClick={() => handleMove(index, 'up')}
                            className="grid h-6 w-6 place-items-center rounded border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                            title="Move Up"
                            aria-label="Move capability up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === capabilities.length - 1 || isReordering}
                            onClick={() => handleMove(index, 'down')}
                            className="grid h-6 w-6 place-items-center rounded border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                            title="Move Down"
                            aria-label="Move capability down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`${ROUTES.INDUSTRIAL_CAPABILITIES}/${cap.id}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-[var(--color-metro-navy)]"
                          title="Edit Capability"
                          aria-label="Edit capability"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(cap.id)}
                          disabled={isDeleting}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete Capability"
                          aria-label="Delete capability"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
