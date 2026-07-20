import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-hell-violet text-white hover:bg-hell-violet2',
        variant === 'secondary' && 'border border-hell-border bg-hell-card text-white hover:bg-hell-purple',
        variant === 'ghost' && 'text-hell-muted hover:text-white',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-500',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-12 px-6 text-lg',
        className,
      )}
      {...props}
    />
  );
}