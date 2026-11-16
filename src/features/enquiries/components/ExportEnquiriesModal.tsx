'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enquiriesService } from '../enquiries.service';
import { downloadEnquiriesCsv } from '../utils/exportEnquiries';
import { EnquirySummary, ENQUIRY_STATUSES } from '../types';
import { useAuthStore } from '@/features/auth/auth.store';
import { ROLES } from '@/lib/constants/roles';
import { Download, Calendar, Filter, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportEnquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFrom?: string;
  initialTo?: string;
  initialStatus?: string;
  initialAssignedTo?: string;
  initialSearch?: string;
}

type DatePreset = 'active' | 'this_month' | 'last_month' | 'all' | 'custom';

function formatToYyyyMmDd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getThisMonthRange(): { from: string; to: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: formatToYyyyMmDd(firstDay),
    to: formatToYyyyMmDd(lastDay),
  };
}

function getLastMonthRange(): { from: string; to: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    from: formatToYyyyMmDd(firstDay),
    to: formatToYyyyMmDd(lastDay),
  };
}

function ExportModalContent({
  onClose,
  initialFrom = '',
  initialTo = '',
  initialStatus = '',
  initialAssignedTo = '',
  initialSearch = '',
}: Omit<ExportEnquiriesModalProps, 'isOpen'>) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isCrmUser = role === ROLES.CRM_USER;

  const defaultRange = getThisMonthRange();
  const hasActiveFilters = Boolean(initialFrom || initialTo);

  const [preset, setPreset] = useState<DatePreset>(hasActiveFilters ? 'active' : 'this_month');
  const [from, setFrom] = useState(hasActiveFilters ? initialFrom : defaultRange.from);
  const [to, setTo] = useState(hasActiveFilters ? initialTo : defaultRange.to);
  const [status, setStatus] = useState(initialStatus);
  const [isExporting, setIsExporting] = useState(false);

  const handlePresetSelect = (newPreset: DatePreset) => {
    setPreset(newPreset);
    if (newPreset === 'this_month') {
      const range = getThisMonthRange();
      setFrom(range.from);
      setTo(range.to);
    } else if (newPreset === 'last_month') {
      const range = getLastMonthRange();
      setFrom(range.from);
      setTo(range.to);
    } else if (newPreset === 'all') {
      setFrom('');
      setTo('');
    } else if (newPreset === 'active') {
      setFrom(initialFrom);
      setTo(initialTo);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const effectiveAssignedTo = isCrmUser ? user?.id : initialAssignedTo || undefined;
      const allResults: EnquirySummary[] = [];
      let currentPage = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await enquiriesService.getEnquiries({
          page: currentPage,
          limit,
          from: from || undefined,
          to: to || undefined,
          status: status || undefined,
          assignedTo: effectiveAssignedTo,
          search: initialSearch || undefined,
        });

        const items = response.data || [];
        allResults.push(...items);

        const pagination = response.meta?.pagination;
        if (pagination) {
          if (currentPage >= pagination.totalPages || items.length === 0) {
            hasMore = false;
          } else {
            currentPage += 1;
          }
        } else {
          hasMore = false;
        }

        // Safety limit to prevent unexpected infinite loops
        if (currentPage > 100) break;
      }

      // Defense-in-depth: If CRM User, strictly filter to their assigned enquiries
      const finalEnquiries =
        isCrmUser && user?.id
          ? allResults.filter((enq) => enq.assignedTo?.id === user.id)
          : allResults;

      if (finalEnquiries.length === 0) {
        toast.error('No enquiries found for the selected date range or filters.');
        setIsExporting(false);
        return;
      }

      let filename = 'enquiries_export';
      if (from && to) {
        filename += `_${from}_to_${to}`;
      } else if (from) {
        filename += `_from_${from}`;
      } else if (to) {
        filename += `_to_${to}`;
      } else {
        filename += '_all';
      }
      filename += '.csv';

      downloadEnquiriesCsv(finalEnquiries, filename);
      toast.success(`Successfully exported ${finalEnquiries.length} enquiries!`);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { message?: string }; message?: string } } })
          ?.response?.data?.error?.message ||
        (err as { message?: string })?.message ||
        'Failed to export enquiries';
      toast.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 p-6">
      {/* Preset Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Date Range Preset
        </label>
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => handlePresetSelect('active')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                preset === 'active'
                  ? 'bg-[var(--color-metro-navy)] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset === 'active' && <Check className="h-3.5 w-3.5" />}
              Active Filters
            </button>
          )}
          <button
            type="button"
            onClick={() => handlePresetSelect('this_month')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              preset === 'this_month'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {preset === 'this_month' && <Check className="h-3.5 w-3.5" />}
            This Month
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('last_month')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              preset === 'last_month'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {preset === 'last_month' && <Check className="h-3.5 w-3.5" />}
            Last Month
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('all')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              preset === 'all'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {preset === 'all' && <Check className="h-3.5 w-3.5" />}
            All Enquiries
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('custom')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              preset === 'custom'
                ? 'bg-[var(--color-metro-navy)] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {preset === 'custom' && <Check className="h-3.5 w-3.5" />}
            Custom Dates
          </button>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            From Date
          </label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPreset('custom');
            }}
            onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
            aria-label="Export From Date"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            To Date
          </label>
          <Input
            type="date"
            value={to}
            min={from}
            onChange={(e) => {
              setTo(e.target.value);
              setPreset('custom');
            }}
            onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
            aria-label="Export To Date"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          Status Filter
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          aria-label="Export Status Filter"
        >
          <option value="">All Statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Info Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900">
        <p className="font-medium">Spreadsheet Download Format</p>
        <p className="text-blue-700/90 mt-0.5">
          Exports a formatted CSV sheet with UTF-8 BOM encoding. Opens seamlessly in Microsoft
          Excel, Google Sheets, and Numbers with Customer Details, Status, Assigned Rep, and Item
          Counts.
        </p>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="ghost" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="gap-2 bg-[var(--color-metro-navy)] hover:bg-[#173e6e]"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing Sheet...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Sheet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function ExportEnquiriesModal(props: ExportEnquiriesModalProps) {
  if (!props.isOpen) return null;

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Export Enquiries Sheet">
      <ExportModalContent {...props} />
    </Modal>
  );
}
