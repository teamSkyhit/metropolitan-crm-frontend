import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#15263d] md:text-[30px]">
        {title}
      </h1>
      {description && <p className="mt-1.5 text-sm leading-6 text-[#6a788c]">{description}</p>}
    </div>
  );
}
