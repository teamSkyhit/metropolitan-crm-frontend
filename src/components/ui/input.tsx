import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3.5 py-2 text-sm text-[#1e2d41] shadow-[0_1px_2px_rgba(15,38,68,0.03)] outline-none transition placeholder:text-gray-400 hover:border-[#c4cfdd] focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
