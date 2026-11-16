'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { enquiriesService } from '../enquiries.service';
import { Mail, Package } from 'lucide-react';

interface EnquiryItemBadgeProps {
  enquiryId: string;
  fallbackCount: number;
}

export function EnquiryItemBadge({ enquiryId, fallbackCount }: EnquiryItemBadgeProps) {
  // If fallbackCount is 1, check if this is the placeholder item from the website contact form.
  // Cached with React Query staleTime so detail pages open instantly.
  const { data } = useQuery({
    queryKey: ['enquiry', enquiryId],
    queryFn: () => enquiriesService.getEnquiryById(enquiryId),
    enabled: fallbackCount === 1,
    staleTime: 5 * 60 * 1000,
  });

  // If count is 0, render 0 items badge directly
  if (fallbackCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        0 items
      </span>
    );
  }

  const detail = data?.data;
  if (detail && detail.lineItems) {
    const isGeneralContactItem = (item: {
      sku?: string | null;
      productId?: string | null;
      productName?: string | null;
    }) =>
      item.sku?.toUpperCase() === 'GENERAL-CONTACT' ||
      item.productId === 'general-inquiry' ||
      item.productName?.toLowerCase().includes('general website enquiry');

    const realItems = detail.lineItems.filter((i) => !isGeneralContactItem(i));
    const isGeneral = detail.lineItems.length > 0 && realItems.length === 0;

    if (isGeneral) {
      return (
        <span
          title="General website contact form enquiry (No specific products requested)"
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100"
        >
          <Mail className="h-3 w-3 text-blue-500" />
          General Enquiry
        </span>
      );
    }

    if (realItems.length > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          <Package className="h-3 w-3 text-slate-500" />
          {realItems.length} {realItems.length === 1 ? 'item' : 'items'}
        </span>
      );
    }
  }

  // Fallback while loading or if count > 1
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
      <Package className="h-3 w-3 text-slate-500" />
      {fallbackCount} {fallbackCount === 1 ? 'item' : 'items'}
    </span>
  );
}
