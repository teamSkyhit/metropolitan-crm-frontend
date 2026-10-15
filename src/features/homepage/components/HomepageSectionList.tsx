/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  useHomepageSections,
  useReorderHomepageSections,
  useDeleteHomepageSection,
} from '../hooks/useHomepage';
import { HomepageSectionType } from '../types';
import { Edit, Trash2, ArrowUp, ArrowDown, LayoutTemplate, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function HomepageSectionList() {
  const { data: sections, isLoading, isError } = useHomepageSections();
  const reorderMutation = useReorderHomepageSections();
  const deleteMutation = useDeleteHomepageSection();

  const [localSections, setLocalSections] = useState<any[]>([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (sections && !isOrderChanged) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSections([...sections].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [sections, isOrderChanged]);

  if (isLoading)
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
        aria-label="Loading homepage sections"
      />
    );
  if (isError)
    return (
      <div
        role="alert"
        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700"
      >
        <AlertCircle className="h-5 w-5" /> Failed to load homepage sections. Refresh the page to
        try again.
      </div>
    );

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No homepage sections configured yet.</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first section.</p>
        <Link
          href="/homepage/new"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-metro-navy)] hover:bg-[var(--color-metro-gold)]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add first section
        </Link>
      </div>
    );
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localSections.length - 1) return;

    const newSections = [...localSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setLocalSections(newSections);
    setIsOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    const items = localSections.map((sec, i) => ({ id: sec.id, sortOrder: i }));
    try {
      await reorderMutation.mutateAsync({ items });
      setIsOrderChanged(false);
      toast.success('Order saved successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to reorder sections');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Section deleted successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to delete section');
    } finally {
      setIsConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const getSectionSummary = (section: any) => {
    switch (section.type) {
      case HomepageSectionType.HERO:
        return `${section.content?.slides?.length || 0} slide(s)`;
      case HomepageSectionType.FEATURED_PRODUCTS:
        return `${section.content?.productIds?.length || 0} product(s)`;
      case HomepageSectionType.FEATURED_CATEGORIES:
        return `${section.content?.categoryIds?.length || 0} categor(ies)`;
      case HomepageSectionType.FEATURED_BRANDS:
        return `${section.content?.brandIds?.length || 0} brand(s)`;
      case HomepageSectionType.PROMO_BANNER:
        return section.content?.heading || 'Promo Banner';
      default:
        return '';
    }
  };

  const formatType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
        <span className="font-semibold">Homepage order:</span> sections appear publicly from top to
        bottom. Use the arrows to reorder, then save your changes.
      </div>
      {isOrderChanged && (
        <div className="sticky top-3 z-10 mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-yellow-800 font-medium">You have unsaved order changes.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLocalSections([...(sections || [])].sort((a, b) => a.sortOrder - b.sortOrder));
                setIsOrderChanged(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={reorderMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md disabled:opacity-50"
            >
              {reorderMutation.isPending ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </div>
      )}
      {localSections.map((section, index) => (
        <div
          key={section.id}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 flex-col gap-1 rounded-xl bg-slate-50 p-1">
              <button
                disabled={index === 0 || reorderMutation.isPending}
                onClick={() => handleMove(index, 'up')}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Move Up"
                aria-label="Move section up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={index === localSections.length - 1 || reorderMutation.isPending}
                onClick={() => handleMove(index, 'down')}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Move Down"
                aria-label="Move section down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {formatType(section.type)}
                </span>
                {section.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                {section.title || formatType(section.type)}
              </h4>
              {section.subtitle && (
                <p className="text-sm text-gray-500 line-clamp-1">{section.subtitle}</p>
              )}
              <p className="text-sm text-gray-600 mt-1 font-medium">{getSectionSummary(section)}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0">
            <Link
              href={`/homepage/${section.id}`}
              className="p-2 text-gray-400 hover:text-[var(--color-metro-navy)] hover:bg-gray-50 rounded-md transition-colors"
              title="Edit Section"
              aria-label="Edit homepage section"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button
              onClick={() => handleDeleteClick(section.id)}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Section"
              aria-label="Delete homepage section"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Homepage Section"
        message="Delete this homepage section? It will no longer be available on the public homepage."
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
      />
    </div>
  );
}
