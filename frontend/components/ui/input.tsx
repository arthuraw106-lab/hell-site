import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition placeholder:text-white/35 focus:border-hell-red',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
