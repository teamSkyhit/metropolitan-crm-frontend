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
          aria-label="Back to Industrial Capabilities"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title="Create Industrial Capability"
          description="Define a new industrial manufacturing capability, visual icon, typical products, and specifications."
        />
      </div>

      <IndustrialCapabilityForm />
    </div>
  );
}
