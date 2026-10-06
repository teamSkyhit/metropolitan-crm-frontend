/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  useHomepageSections,
  useReorderHomepageSections,
  useDeleteHomepageSection,
} from '../hooks/useHomepage';
import { HomepageSectionType } from '../types';
import { Edit, Trash2, ArrowUp, ArrowDown, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export function HomepageSectionList() {
  const { data: sections, isLoading, isError } = useHomepageSections();
  const reorderMutation = useReorderHomepageSections();
  const deleteMutation = useDeleteHomepageSection();

  const [localSections, setLocalSections] = useState<any[]>([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);

  useEffect(() => {
    if (sections) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSections([...sections].sort((a, b) => a.sortOrder - b.sortOrder));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOrderChanged(false);
    }
  }, [sections]);

  if (isLoading) return <div className="text-center py-10">Loading sections...</div>;
  if (isError)
    return <div className="text-center py-10 text-red-500">Failed to load homepage sections.</div>;

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
        <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No homepage sections configured yet.</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first section.</p>
        <Link
          href="/homepage/new"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-metro-navy)] hover:bg-[var(--color-metro-gold)]"
        >
          Add First Section
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
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to reorder sections');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Delete this homepage section? It will no longer be available on the public homepage.'
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.error?.message || 'Failed to delete section');
      }
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
      {isOrderChanged && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between mb-6">
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
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-6 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <button
                disabled={index === 0 || reorderMutation.isPending}
                onClick={() => handleMove(index, 'up')}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={index === localSections.length - 1 || reorderMutation.isPending}
                onClick={() => handleMove(index, 'down')}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            <div>
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

          <div className="flex items-center gap-2">
            <Link
              href={`/homepage/${section.id}`}
              className="p-2 text-gray-400 hover:text-[var(--color-metro-navy)] hover:bg-gray-50 rounded-md transition-colors"
              title="Edit Section"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button
              onClick={() => handleDelete(section.id)}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Section"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
