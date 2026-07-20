'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Crown, Flame, Heart, MessageCircle,
  Play, Search, ShieldCheck, Sparkles, Star, TrendingUp, Vote, Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet, apiPost } from '@/lib/api';
import type { Manga, Paginated, PollProject } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';
import { StoryStrip } from './story-strip';
import { Reveal } from '@/components/effects/reveal';
import { Badge } from '@/components/ui/badge';

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manga', 'home'],
    queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 10 }),
  });

  const { data: popular = [] } = useQuery({
    queryKey: ['manga', 'popular'],
    queryFn: () => apiGet<Manga[]>('/manga/popular'),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['polls', 'home'],
    queryFn: () => apiGet<PollProject[]>('/polls'),
  });

  const mangas = data?.items ?? [];
  const featured = popular[0] ?? mangas[0];
  const secondaryFeatured = popular[1] ?? mangas[1] ?? featured;
  const latestChapters = mangas.flatMap((m) =>
    (m.chapters ?? []).slice(0, 2).map((c) => ({ manga: m, chapter: c })),
  );

  return (
    <AppShell>
      {/* ──────── HERO ──────── */}
      {featured ? (
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-hell-border">
          <div className="relative h-[500px] md:h-[650px]">
            <img
              src={featured.cover ?? getImageFallback(featured.title)}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-hell-bg via-hell-bg/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-hell-bg/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-10 lg:p-14">
              <Reveal>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hell-purple/30 bg-hell-purple/20 px-4 py-2 text-sm font-bold text-hell-light">
                  <Sparkles size={16} />
                  پلتفرم حرفه‌ای مانهوا
                </div>

                <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
                  دنیای{' '}
                  <span className="text-gradient">تاریک و جذاب</span> مانهواها
                </h1>

                <p className="mt-4 max-w-lg leading-8 text-hell-muted">
                  تازه‌ترین مانهواها، چپترهای جدید، خواندن آنلاین، چت، استوری و رأی‌گیری؛ همه در یک جهان.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/manga"
                    className="inline-flex items-center gap-2 rounded-xl bg-hell-violet px-5 py-2.5 font-bold text-white transition-colors hover:bg-hell-violet2"
                  >
                    <BookOpen size={18} /> شروع خواندن
                  </Link>
                  {featured.chapters?.[0] ? (
                    <Link
                      href={`/reader/${featured.chapters[0].id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-hell-border bg-hell-card px-5 py-2.5 font-bold transition-colors hover:bg-hell-purple"
                    >
                      <Play size={18} /> ادامه محبوب‌ترین
                    </Link>
                  ) : null}
                </div>

                {/* Stats */}
                <div className="mt-8 flex gap-6 text-sm">
                  <div>
                    <span className="block text-2xl font-black text-hell-light">{data?.meta?.total ?? mangas.length}+</span>
                    <span className="text-hell-muted">مانهوا</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-hell-light">{latestChapters.length}+</span>
                    <span className="text-hell-muted">چپتر جدید</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-hell-light">Real-time</span>
                    <span className="text-hell-muted">سیستم زنده</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ) : (
        /* No featured — simple intro */
        <section className="mb-10 rounded-2xl border border-hell-border bg-hell-card p-8 md:p-14">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hell-purple/30 bg-hell-purple/20 px-4 py-1.5 text-sm font-bold tracking-wide text-hell-light">
              <Sparkles size={16} />
              پلتفرم حرفه‌ای مانهوا
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
              دنیای{' '}
              <span className="text-gradient">تاریک و جذاب</span> مانهواها
            </h1>
            <p className="mt-4 max-w-lg leading-8 text-hell-muted">
              تازه‌ترین مانهواها، چپترهای جدید، خواندن آنلاین، چت، استوری و رأی‌گیری؛ همه در یک جهان.
            </p>
            <div className="mt-6">
              <Link
                href="/manga"
                className="inline-flex items-center gap-2 rounded-xl bg-hell-violet px-5 py-2.5 font-bold text-white transition-colors hover:bg-hell-violet2"
              >
                <BookOpen size={18} /> ورود به کتابخانه
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ──────── STORY STRIP ──────── */}
      <StoryStrip />

      {/* ──────── TRENDING ──────── */}
      <section className="mb-10">
        <Reveal>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-hell-light">
                <TrendingUp size={18} />
                <span className="font-black">ترند امروز</span>
              </div>
              <h2 className="text-2xl font-black">مانهواهای تازه و داغ</h2>
            </div>
            <Link href="/manga" className="group flex items-center gap-1 text-sm text-hell-muted transition-colors hover:text-white">
              کتابخانه <ArrowLeft size={16} />
            </Link>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-[320px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mangas.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.slug}`}
                className="group overflow-hidden rounded-xl border border-hell-border bg-hell-card transition-colors hover:border-hell-violet"
              >
                <div className="relative">
                  <img
                    src={manga.cover ?? getImageFallback(manga.title)}
                    alt={manga.title}
                    className="aspect-[2/3] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute right-2 top-2 rounded-md bg-hell-bg/80 px-2 py-0.5 text-[10px] font-bold text-hell-light">
                    {manga.status}
                  </div>
                  {manga._count?.likes ? (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-hell-bg/70 px-2 py-0.5 text-xs">
                      <Heart size={11} className="text-hell-violet" />
                      {manga._count.likes}
                    </div>
                  ) : null}
                </div>
                <div className="p-2.5">
                  <h3 className="truncate text-sm font-bold group-hover:text-hell-light">{manga.title}</h3>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-hell-muted">
                    <BookOpen size={11} />
                    {manga.chapters?.[0] ? `چپتر ${manga.chapters[0].number}` : 'به‌زودی'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ──────── LATEST CHAPTERS + POLLS ──────── */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Latest chapters */}
        <Reveal>
          <div className="rounded-xl border border-hell-border bg-hell-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={19} className="text-hell-light" />
                <h2 className="text-lg font-black">آخرین چپترها</h2>
              </div>
              <Link href="/manga" className="text-xs text-hell-muted hover:text-white">همه</Link>
            </div>

            {latestChapters.length ? (
              <div className="grid gap-2">
                {latestChapters.slice(0, 8).map(({ manga, chapter }) => (
                  <Link
                    key={`${manga.id}-${chapter.id}`}
                    href={`/reader/${chapter.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-hell-purple/20"
                  >
                    <img
                      src={manga.cover ?? getImageFallback(manga.title)}
                      alt={manga.title}
                      className="h-14 w-10 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{manga.title}</p>
                      <p className="truncate text-xs text-hell-muted">
                        چپتر {chapter.number}: {chapter.title}
                      </p>
                    </div>
                    <ArrowLeft size={16} className="shrink-0 text-hell-muted" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-hell-bg p-4 text-sm text-hell-muted">چپتری ثبت نشده.</p>
            )}
          </div>
        </Reveal>

        {/* Polls */}
        <Reveal>
          <div className="space-y-3">
            <div className="rounded-2xl border border-hell-border bg-hell-card p-5">
              <div className="mb-4 flex items-center gap-2 text-hell-violet">
                <Crown />
                <h2 className="font-black">انتخاب ویژه</h2>
              </div>
              {secondaryFeatured ? (
                <Link href={`/manga/${secondaryFeatured.slug}`} className="group block">
                  <img
                    src={secondaryFeatured.cover ?? getImageFallback(secondaryFeatured.title)}
                    alt={secondaryFeatured.title}
                    className="h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                  <h3 className="mt-3 font-bold group-hover:text-hell-light">{secondaryFeatured.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-hell-muted">{secondaryFeatured.description}</p>
                </Link>
              ) : (
                <p className="text-sm text-hell-muted">موردی نیست.</p>
              )}
            </div>

            <div className="rounded-2xl border border-hell-border bg-hell-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Vote size={18} className="text-hell-violet" />
                <h2 className="font-black">رأی‌گیری ترجمه</h2>
              </div>
              {polls.length ? (
                <div className="space-y-2">
                  {polls.slice(0, 3).map((poll) => (
                    <div key={poll.id} className="rounded-lg border border-hell-border bg-hell-bg p-3">
                      <h3 className="text-sm font-bold">{poll.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-hell-muted">{poll.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-hell-muted">{poll._count?.votes ?? 0} رأی</span>
                        <button
                          onClick={async () => { await apiPost(`/polls/${poll.id}/vote`); window.location.reload(); }}
                          className="rounded-lg bg-hell-violet px-3 py-1 text-xs font-bold hover:bg-hell-violet2"
                        >رأی بده</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-hell-muted">رأی‌گیری فعالی نیست.</p>
              )}
              <Link href="/polls" className="mt-3 inline-block text-xs font-bold text-hell-light">
                رفتن به صفحه رأی‌گیری
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────── FEATURES ──────── */}
            <section className="pb-10">
              <div className="grid gap-4 md:grid-cols-3">
                <Reveal>
                  <div className="rounded-xl border border-hell-border bg-hell-card p-5">
                    <ShieldCheck className="mb-3 text-hell-violet" size={26} />
                    <h3 className="text-lg font-black">امنیت و نقش‌ها</h3>
                    <p className="mt-1 text-sm text-hell-muted">JWT، Refresh Token، RBAC و محافظت API</p>
                  </div>
                </Reveal>
                <Reveal delay={0.05}>
                  <div className="rounded-xl border border-hell-border bg-hell-card p-5">
                    <MessageCircle className="mb-3 text-hell-violet" size={26} />
                    <h3 className="text-lg font-black">چت و جامعه</h3>
                    <p className="mt-1 text-sm text-hell-muted">چت زنده، استوری و بات هوشمند</p>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-hell-border bg-hell-card p-5">
                    <Search className="mb-3 text-hell-violet" size={26} />
                    <h3 className="text-lg font-black">جستجو و رشد</h3>
                    <p className="mt-1 text-sm text-hell-muted">SEO، فیلتر و رشد محتوا</p>
                  </div>
                </Reveal>
              </div>
            </section>
    </AppShell>
  );
}