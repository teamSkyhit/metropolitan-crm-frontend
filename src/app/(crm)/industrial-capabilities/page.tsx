'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { IndustrialCapabilityList } from '@/features/industrial-capabilities/components/IndustrialCapabilityList';
import { IndustrialCapabilitySettingsForm } from '@/features/industrial-capabilities/components/IndustrialCapabilitySettingsForm';
import { Factory, Settings2 } from 'lucide-react';

export default function IndustrialCapabilitiesPage() {
  const [activeTab, setActiveTab] = useState<'segments' | 'settings'>('segments');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Industrial Capabilities"
          description="Manage core industrial manufacturing capabilities, typical products, and storefront hero section content."
        />

        {/* Tab Navigation */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('segments')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'segments'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Factory size={13} />
            Capabilities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 size={13} />
            Section Settings
          </button>
        </div>
      </div>

      {activeTab === 'segments' ? (
        <IndustrialCapabilityList />
      ) : (
        <div className="space-y-6">
          <IndustrialCapabilitySettingsForm />
        </div>
      )}
    </div>
  );
}
