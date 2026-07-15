import { LucideIcon, SearchX } from 'lucide-react';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

export function EmptyState({
  title = 'چیزی پیدا نشد',
  message = 'فعلاً داده‌ای برای نمایش وجود ندارد.',
  icon: Icon = SearchX,
  action,
}: {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <Card className="rounded-[2rem] p-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/[0.06] text-white/35">
        <Icon size={34} />
      </div>
      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-white/45">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
