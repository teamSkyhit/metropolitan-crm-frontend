import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
          {
            'bg-[var(--color-metro-navy)] text-white shadow-[0_6px_16px_rgba(16,47,87,0.18)] hover:bg-[#173e6e] hover:shadow-[0_8px_20px_rgba(16,47,87,0.24)]':
              variant === 'default',
            'border border-[#dce3ec] bg-white text-[#26364a] shadow-sm hover:border-[#bdc9d8] hover:bg-[#f8fafc]':
              variant === 'outline',
            'text-gray-600 hover:bg-[#eef3f8] hover:text-[#102f57]': variant === 'ghost',
            'bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'destructive',
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-lg px-3': size === 'sm',
            'h-12 px-7': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
