import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-32 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-hell-red',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
