import { cn } from '@/lib/utils/cn';

export type EnquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

interface StatusBadgeProps {
  status: EnquiryStatus;
  className?: string;
}

const statusConfig: Record<EnquiryStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ASSIGNED: { label: 'Assigned', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  CONTACTED: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  QUOTATION_SENT: {
    label: 'Quotation Sent',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  NEGOTIATION: {
    label: 'Negotiation',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  CLOSED_WON: { label: 'Closed Won', className: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED_LOST: { label: 'Closed Lost', className: 'bg-red-100 text-red-800 border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
