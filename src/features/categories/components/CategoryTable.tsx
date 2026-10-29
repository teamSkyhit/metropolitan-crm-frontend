/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Edit2,
  Image as ImageIcon,
  Trash2,
  LoaderCircle,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Category } from '../types';
import { useDeleteCategory, useReorderCategories } from '../hooks/useCategories';
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

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategoryTable({ categories, isLoading }: CategoryTableProps) {
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const { mutate: reorderCategories, isPending: isReordering } = useReorderCategories();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-56 items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-xs"
      >
        <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-metro-navy)]" /> Loading
        categories catalogue...
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/80">
          <ImageIcon className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No categories found</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          No categories match your active filters. Try searching for something else or create your
          first storefront category.
        </p>
        <Link
          href="/categories/new"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-metro-navy)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#153866]"
        >
          <Plus className="h-4 w-4" />
          Create Category
        </Link>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      setDeleteId(null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const ids = newOrder.map((c) => c.id);
    reorderCategories(ids, {
      onSuccess: () => {
        toast.success('Categories reordered successfully');
      },
      onError: () => {
        toast.error('Failed to update category order');
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products currently assigned to this category will need to be reclassified."
        confirmLabel="Delete Category"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Mobile Card Layout */}
      <div className="divide-y divide-slate-100 md:hidden">
        {categories.map((category, index) => {
          const previewImage = category.imageUrl || category.bannerUrl;
          return (
            <div key={category.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                {previewImage ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                    <img
                      src={previewImage}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/categories/${category.id}`}
                      className="font-bold text-slate-900 truncate hover:text-[var(--color-metro-navy)]"
                    >
                      {category.name}
                    </Link>
                    {category.icon && (
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[var(--color-metro-navy)]"
                        title={`Icon: ${category.icon}`}
                      >
                        <ProductContentIcon icon={category.icon} size={13} />
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-slate-400 truncate">/{category.slug}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    category.isActive
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      category.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {category.isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Order:</span>
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-600">
                    {category.sortOrder}
                  </span>
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      disabled={index === 0 || isReordering}
                      onClick={() => handleMove(index, 'up')}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                      title="Move Up"
                      aria-label="Move category up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === categories.length - 1 || isReordering}
                      onClick={() => handleMove(index, 'down')}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                      title="Move Down"
                      aria-label="Move category down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/categories/${category.id}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-[var(--color-metro-navy)]"
                    title="Edit Category"
                    aria-label="Edit category"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete Category"
                    aria-label="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/75">
              <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Icon
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                URL Path
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </TableHead>
              <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Display Order
              </TableHead>
              <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => {
              const previewImage = category.imageUrl || category.bannerUrl;
              return (
                <TableRow
                  key={category.id}
                  className="group border-b border-slate-100 transition-colors hover:bg-slate-50/60"
                >
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex items-center gap-3.5">
                      {previewImage ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                          <img
                            src={previewImage}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/categories/${category.id}`}
                          className="font-bold text-slate-900 transition hover:text-[var(--color-metro-navy)]"
                        >
                          {category.name}
                        </Link>
                        {category.description && (
                          <p className="max-w-xs truncate text-xs text-slate-400">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    {category.icon ? (
                      <div className="flex items-center gap-1.5" title={category.icon}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[var(--color-metro-navy)]">
                          <ProductContentIcon icon={category.icon} size={15} />
                        </div>
                        <span className="font-mono text-xs text-slate-500 capitalize">
                          {category.icon}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="font-mono text-xs text-slate-500">/{category.slug}</span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.isActive
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          category.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {category.isActive ? 'Active' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 font-mono text-xs font-semibold text-slate-600">
                        {category.sortOrder}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || isReordering}
                          onClick={() => handleMove(index, 'up')}
                          className="grid h-6 w-6 place-items-center rounded border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                          title="Move Up"
                          aria-label="Move category up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1 || isReordering}
                          onClick={() => handleMove(index, 'down')}
                          className="grid h-6 w-6 place-items-center rounded border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
                          title="Move Down"
                          aria-label="Move category down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/categories/${category.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-[var(--color-metro-navy)]"
                        title="Edit Category"
                        aria-label="Edit category"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={isDeleting}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete Category"
                        aria-label="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
