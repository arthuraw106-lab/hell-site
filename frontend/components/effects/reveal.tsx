import { ReactNode } from 'react';

// Simplified Reveal — no animation delay, just simple fade-in.
export function Reveal({ children, className }: { children: ReactNode; delay?: number; className?: string }) {
 return <div className={`animate-reveal ${className || ''}`}>{children}</div>;
}