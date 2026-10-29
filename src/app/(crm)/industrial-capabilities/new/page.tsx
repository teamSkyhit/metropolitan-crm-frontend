'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { IndustrialCapabilityForm } from '@/features/industrial-capabilities/components/IndustrialCapabilityForm';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowLeft } from 'lucide-react';

export default function NewIndustrialCapabilityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href={ROUTES.INDUSTRIAL_CAPABILITIES}
          className="mt-1 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back
        </Link>
        <PageHeader
          title="Create Industrial Capability"
          description="Define a new industrial manufacturing capability segment, visual icon, typical products, and specifications."
        />
      </div>

      <IndustrialCapabilityForm />
    </div>
  );
}
