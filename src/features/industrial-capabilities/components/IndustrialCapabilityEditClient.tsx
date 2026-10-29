'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { IndustrialCapabilityForm } from './IndustrialCapabilityForm';
import { useIndustrialCapability } from '../hooks/useIndustrialCapabilities';
import { ROUTES } from '@/lib/constants/routes';

export function IndustrialCapabilityEditClient({ id }: { id: string }) {
  const { data: capability, isLoading, error } = useIndustrialCapability(id);

  if (!id || isLoading) {
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
        aria-label="Loading capability"
      />
    );
  }

  if (error || !capability) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700"
      >
        Failed to load this industrial capability. Return to capabilities list and try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href={ROUTES.INDUSTRIAL_CAPABILITIES}
          aria-label="Back to industrial capabilities"
          className="mt-1 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back
        </Link>
        <PageHeader
          title={`Edit ${capability.title}`}
          description="Update capability information, specifications, typical products, and storefront artwork."
        />
      </div>

      <IndustrialCapabilityForm initialData={capability} />
    </div>
  );
}
