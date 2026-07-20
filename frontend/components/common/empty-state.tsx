'use client';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-hell-border bg-hell-card p-6 text-center">
      <p className="font-bold">{title}</p>
      {description ? <p className="mt-1 text-sm text-hell-muted">{description}</p> : null}
    </div>
  );
}