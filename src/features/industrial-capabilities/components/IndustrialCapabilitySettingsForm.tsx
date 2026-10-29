'use client';

import React, { useState } from 'react';
import {
  useIndustrialCapabilitySettings,
  useUpdateIndustrialCapabilitySettings,
} from '../hooks/useIndustrialCapabilities';
import { IndustrialCapabilitySectionSettings } from '../types';
import { Settings2, LoaderCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function SettingsFormInner({
  initialSettings,
}: {
  initialSettings: IndustrialCapabilitySectionSettings;
}) {
  const updateMutation = useUpdateIndustrialCapabilitySettings();

  const [eyebrow, setEyebrow] = useState(initialSettings.eyebrow || '');
  const [title, setTitle] = useState(initialSettings.title || '');
  const [description, setDescription] = useState(initialSettings.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.length > 1000) {
      toast.error('Description cannot exceed 1000 characters');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        eyebrow: eyebrow.trim() || null,
        title: title.trim() || null,
        description: description.trim() || null,
      });
      toast.success('Section settings updated successfully');
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { error?: { message?: string }; message?: string } };
      };
      toast.error(
        errorObj.response?.data?.error?.message ||
          errorObj.response?.data?.message ||
          'Failed to update section settings'
      );
    }
  };

  const descLength = description.length;
  const isDescOver = descLength > 1000;

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Settings2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Capabilities Section Settings</h2>
            <p className="text-xs text-slate-500">
              Customize the section header, subtitle, and intro text displayed on the public
              storefront.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending || isDescOver}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-metro-navy)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#153866] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="settings-eyebrow"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Section Eyebrow
              </label>
              <span className="text-[11px] text-slate-400">{eyebrow.length} / 100</span>
            </div>
            <input
              id="settings-eyebrow"
              type="text"
              maxLength={100}
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="e.g. OUR INDUSTRIAL CAPABILITIES"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="settings-title"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Section Title
              </label>
              <span className="text-[11px] text-slate-400">{title.length} / 200</span>
            </div>
            <input
              id="settings-title"
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SIX CORE SEGMENTS"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="settings-description"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Section Description
            </label>
            <span
              className={`text-[11px] font-mono ${
                isDescOver ? 'font-bold text-red-600' : 'text-slate-400'
              }`}
            >
              {descLength} / 1000
            </span>
          </div>
          <textarea
            id="settings-description"
            rows={3}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce the industrial capabilities segment for storefront visitors..."
            className={`w-full resize-y rounded-xl border bg-white p-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-4 ${
              isDescOver
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-[#102f57]/10'
            }`}
          />
        </div>
      </div>
    </form>
  );
}

export function IndustrialCapabilitySettingsForm() {
  const { data: settings, isLoading } = useIndustrialCapabilitySettings();

  if (isLoading || !settings) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
        <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-metro-navy)]" />
      </div>
    );
  }

  return <SettingsFormInner key={settings.title || 'settings-form'} initialSettings={settings} />;
}
