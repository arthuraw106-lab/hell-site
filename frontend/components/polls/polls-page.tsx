'use client';

import { useQuery } from '@tanstack/react-query';
import { Vote } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet, apiPost } from '@/lib/api';
import type { PollProject } from '@/lib/types';

export function PollsPage() {
  const { data: polls = [] } = useQuery({
    queryKey: ['polls', 'all'],
    queryFn: () => apiGet<PollProject[]>('/polls'),
  });

  return (
    <AppShell>
      <h1 className="mb-4 flex items-center gap-2 text-xl font-black"><Vote className="text-hell-violet" size={20} /> رأی‌گیری پروژه‌ها</h1>
      {!polls.length ? (
        <p className="text-hell-muted">رأی‌گیری فعالی وجود ندارد.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {polls.map((poll) => (
            <div key={poll.id} className="card flex flex-col p-4">
              {poll.cover ? <img src={poll.cover} alt={poll.title} className="mb-3 h-32 w-full rounded-lg object-cover" loading="lazy" /> : null}
              <h2 className="font-bold">{poll.title}</h2>
              <p className="mt-1 flex-1 text-sm text-hell-muted">{poll.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-hell-muted">{poll._count?.votes ?? 0} رأی</span>
                <button
                  onClick={async () => { await apiPost(`/polls/${poll.id}/vote`); window.location.reload(); }}
                  className="rounded-lg bg-hell-violet px-3 py-1.5 text-sm font-bold hover:bg-hell-violet2"
                >رأی بده</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}