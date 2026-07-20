import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, ...props }, ref) => (
 <textarea
 ref={ref}
 className={cn(
 'min-h-24 w-full rounded-lg border border-hell-border bg-hell-card px-3 py-2 text-white outline-none transition-colors placeholder:text-hell-muted focus:border-hell-violet',
 className,
 )}
 {...props}
 />
 ),
);

Textarea.displayName = 'Textarea';