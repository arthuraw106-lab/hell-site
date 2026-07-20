import * as React from 'react';
import { cn } from '@/lib/utils';

type ProButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
 variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function ProButton({ className, variant = 'primary', children, ...props }: ProButtonProps) {
 return (
 <button
 className={cn(
 'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none',
 variant === 'primary' && 'bg-hell-violet text-white hover:bg-hell-violet2',
 variant === 'secondary' && 'border border-hell-border bg-hell-card text-white hover:bg-hell-purple',
 variant === 'ghost' && 'text-hell-muted hover:text-white',
 variant === 'danger' && 'bg-red-600 text-white hover:bg-red-500',
 className,
 )}
 {...props}
 >
 {children}
 </button>
 );
}