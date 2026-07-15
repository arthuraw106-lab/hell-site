import { ReactNode } from 'react';

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-reveal ${className || ''}`}
      style={{ animationDelay: `${0.2 + delay}s` }}
    >
      {children}
    </div>
  );
}