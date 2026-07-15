import * as React from 'react';
import { cn } from '@/lib/utils';

type ProButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function ProButton({ className, variant = 'primary', children, ...props }: ProButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl px-6 font-black transition duration-300 disabled:pointer-events-none disabled:opacity-60',
        variant === 'primary' &&
          'bg-gradient-to-l from-hell-red to-hell-violet text-white shadow-glow hover:scale-[1.02] active:scale-[.98]',
        variant === 'secondary' &&
          'border border-white/10 bg-white/10 text-white hover:bg-white/15 hover:shadow-soft',
        variant === 'ghost' &&
          'text-white/70 hover:bg-white/10 hover:text-white',
        variant === 'danger' &&
          'bg-red-600 text-white hover:bg-red-500',
        className,
      )}
      {...props}
    >
      {variant === 'primary' ? (
        <span className="absolute inset-0 translate-x-full bg-gradient-to-l from-white/0 via-white/25 to-white/0 transition duration-700 group-hover:-translate-x-full" />
      ) : null}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
