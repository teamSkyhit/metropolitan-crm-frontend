import { cn } from '@/lib/utils/cn';

import { EnquiryStatus } from '@/features/enquiries/types';

interface StatusBadgeProps {
  status: EnquiryStatus;
  className?: string;
}

const statusConfig: Record<EnquiryStatus, { label: string; className: string; dotColor: string }> =
  {
    NEW: {
      label: 'New',
      className: 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs',
      dotColor: 'bg-blue-500',
    },
    ASSIGNED: {
      label: 'Assigned',
      className: 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-2xs',
      dotColor: 'bg-purple-500',
    },
    CONTACTED: {
      label: 'Contacted',
      className: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs',
      dotColor: 'bg-amber-500',
    },
    QUOTATION_SENT: {
      label: 'Quotation Sent',
      className: 'bg-orange-50 text-orange-700 border-orange-200/80 shadow-2xs',
      dotColor: 'bg-orange-500',
    },
    NEGOTIATION: {
      label: 'Negotiation',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-2xs',
      dotColor: 'bg-indigo-500',
    },
    CLOSED_WON: {
      label: 'Closed Won',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs',
      dotColor: 'bg-emerald-500',
    },
    CLOSED_LOST: {
      label: 'Closed Lost',
      className: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs',
      dotColor: 'bg-rose-500',
    },
  };

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-700 border-slate-200/80',
    dotColor: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
        config.className,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            config.dotColor
          )}
        />
        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', config.dotColor)} />
      </span>
      {config.label}
    </span>
  );
}
