'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Play, TrendingUp, Vote } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet, apiPost } from '@/lib/api';
import type { Manga, Paginated, PollProject } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';

export function HomePage() {
  const { data } = useQuery({
    queryKey: ['manga', 'home'],
    queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 10 }),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['polls', 'home'],
    queryFn: () => apiGet<PollProject[]>('/polls'),
  });

  const mangas = data?.items ?? [];
  const featured = mangas[0];
  const latestChapters = mangas.flatMap((m) => (m.chapters ?? []).slice(0, 2).map((c) => ({ manga: m, chapter: c })));

  return (
    <AppShell>
      {/* Hero */}
      {featured ? (
        <section className="mb-8">
          <Link href={`/manga/${featured.slug}`} className="block overflow-hidden rounded-2xl border border-hell-border">
            <div className="relative">
              <img
                src={featured.cover ?? getImageFallback(featured.title)}
                alt={featured.title}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hell-bg via-hell-bg/50 to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-5">
                <h1 className="text-3xl font-black">{featured.title}</h1>
                <p className="mt-1 line-clamp-2 text-sm text-hell-muted">{featured.description}</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-md bg-hell-violet/40 px-2 py-1 text-xs font-bold text-hell-light">{featured.status}</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Trending */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black"><TrendingUp size={20} className="text-hell-violet" /> مانهواهای جديد</h2>
          <Link href="/manga" className="text-sm text-hell-muted hover:text-white">همه</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mangas.map((m) => (
            <Link key={m.id} href={`/manga/${m.slug}`} className="group overflow-hidden rounded-xl border border-hell-border bg-hell-card">
              <div className="relative">
                <img
                  src={m.cover ?? getImageFallback(m.title)}
                  alt={m.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute right-2 top-2 rounded-md bg-hell-bg/80 px-2 py-0.5 text-[10px] font-bold">{m.status}</div>
              </div>
              <div className="p-2">
                <h3 className="truncate text-sm font-bold group-hover:text-hell-violet">{m.title}</h3>
                <p className="truncate text-[10px] text-hell-muted">{m.chapters?.[0]?.number ? `چپتر ${m.chapters[0].number}` : 'به‌زودی'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest chapters + polls */}
      <section className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="mb-3 text-lg font-black">آخرين چپترها</h2>
          <div className="space-y-2">
            {latestChapters.slice(0, 6).map(({ manga, chapter }) => (
              <Link
                key={`${manga.id}-${chapter.id}`}
                href={`/reader/${chapter.id}`}
                className="flex items-center gap-3 rounded-lg border border-hell-border bg-hell-card p-2 transition-colors hover:border-hell-violet"
              >
                <img src={manga.cover ?? getImageFallback(manga.title)} alt={manga.title} className="h-12 w-9 rounded-md object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold">{manga.title}</h3>
                  <p className="truncate text-xs text-hell-muted">چپتر {chapter.number}: {chapter.title}</p>
                </div>
              </Link>
            ))}
            {!latestChapters.length && <p className="text-sm text-hell-muted">هنوز چپتری ثبت نشده.</p>}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black"><Vote size={20} className="text-hell-violet" /> رأی‌گیری</h2>
          <div className="space-y-2">
            {polls.slice(0, 3).map((poll) => (
              <div key={poll.id} className="rounded-lg border border-hell-border bg-hell-card p-3">
                <h3 className="text-sm font-bold">{poll.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-hell-muted">{poll.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-hell-muted">{poll._count?.votes ?? 0} رأی</span>
                  <button
                    className="rounded-md bg-hell-violet px-2 py-1 text-[10px] font-bold"
                    onClick={async () => { await apiPost(`/polls/${poll.id}/vote`); window.location.reload(); }}
                  >
                    رأی
                  </button>
                </div>
              </div>
            ))}
            {!polls.length && <p className="text-sm text-hell-muted">رأی‌گیری فعالی نیست.</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}