import { cn } from '@/lib/utils/cn';
import { ProductStatus } from '../types';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const statusConfig: Record<ProductStatus, { label: string; className: string; dotColor: string }> =
  {
    DRAFT: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700 border-slate-200/90 shadow-2xs',
      dotColor: 'bg-slate-400',
    },
    PUBLISHED: {
      label: 'Published',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-2xs',
      dotColor: 'bg-emerald-500',
    },
  };

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-700 border-slate-200',
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
