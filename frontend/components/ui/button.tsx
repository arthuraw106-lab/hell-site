import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-bold transition disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-hell-red text-white shadow-glow hover:bg-red-500',
        variant === 'secondary' && 'border border-white/10 bg-white/10 text-white hover:bg-white/15',
        variant === 'ghost' && 'text-white/75 hover:bg-white/10 hover:text-white',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-500',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-11 px-5',
        size === 'lg' && 'h-13 px-7 text-lg',
        className,
      )}
      {...props}
    />
  );
}
