import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-hell-border bg-hell-card px-3 text-white outline-none transition-colors placeholder:text-hell-muted focus:border-hell-violet',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';