'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Calendar,
  Download,
  Flame,
  Heart,
  Layers,
  PlayCircle,
  Star,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/effects/reveal';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProButton } from '@/components/ui/pro-button';
import { apiGet, apiPost } from '@/lib/api';
import type { Manga } from '@/lib/types';
import { getImageFallback, toPersianDate } from '@/lib/utils';

export function MangaDetailPage({ slug }: { slug: string }) {
  const { data: manga, isLoading, refetch } = useQuery({
    queryKey: ['manga', 'detail-stage-5', slug],
    queryFn: () => apiGet<Manga>(`/manga/${slug}`),
  });

  const likeMutation = useMutation({
    mutationFn: () => apiPost(`/manga/${manga?.id}/like`),
    onSuccess: () => refetch(),
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => apiPost(`/manga/${manga?.id}/bookmark`),
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-7xl px-5 py-10">
          <Card className="h-[650px] rounded-[2.5rem] skeleton" />
        </main>
      </AppShell>
    );
  }

  if (!manga) {
    return (
      <AppShell>
        <main className="mx-auto max-w-7xl px-5 py-10">
          <Card className="rounded-[2rem] p-8 text-center">
            <h1 className="text-2xl font-black">مانهوا پیدا نشد.</h1>
            <Link href="/manga" className="mt-4 inline-block text-hell-gold">
              بازگشت به کتابخانه
            </Link>
          </Card>
        </main>
      </AppShell>
    );
  }

  const firstChapter = manga.chapters?.[manga.chapters.length - 1];
  const latestChapter = manga.chapters?.[0];

  return (
    <AppShell>
      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-35">
            <img
              src={manga.banner || manga.cover || getImageFallback(manga.title)}
              alt={manga.title}
              className="h-full w-full object-cover blur-sm"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050509]/20 via-[#050509]/88 to-[#050509]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[360px_1fr]">
            <Reveal>
              <div className="premium-border neo-card pulse-glow overflow-hidden rounded-[2.5rem] p-4">
                <img
                  src={manga.cover || getImageFallback(manga.title)}
                  alt={manga.title}
                  className="h-[520px] w-full rounded-[2rem] object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="py-5">
                <div className="mb-4 flex flex-wrap gap-2">
                  {manga.genres?.map((genre) => (
                    <Badge key={genre.id} className="bg-hell-violet/15 text-violet-100">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-5xl font-black leading-tight md:text-7xl">
                  {manga.title}
                </h1>

                {manga.altTitle ? <p className="mt-3 text-lg text-white/45">{manga.altTitle}</p> : null}

                <p className="mt-7 max-w-3xl text-lg leading-9 text-white/62">
                  {manga.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {firstChapter ? (
                    <Link href={`/reader/${firstChapter.id}`}>
                      <ProButton>
                        <PlayCircle size={19} />
                        شروع خواندن
                      </ProButton>
                    </Link>
                  ) : null}

                  {latestChapter ? (
                    <Link href={`/reader/${latestChapter.id}`}>
                      <ProButton variant="secondary">
                        <ArrowLeft size={18} />
                        آخرین چپتر
                      </ProButton>
                    </Link>
                  ) : null}

                  <Button variant="secondary" onClick={() => bookmarkMutation.mutate()} disabled={bookmarkMutation.isPending}>
                    <Bookmark size={18} />
                    <span className="mr-2">بوکمارک</span>
                  </Button>

                  <Button variant="secondary" onClick={() => likeMutation.mutate()} disabled={likeMutation.isPending}>
                    <Heart size={18} />
                    <span className="mr-2">لایک</span>
                  </Button>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    [manga._count?.likes || 0, 'لایک', Heart],
                    [manga._count?.bookmarks || 0, 'بوکمارک', Bookmark],
                    [manga.chapters?.length || 0, 'چپتر', Layers],
                    [manga.status, 'وضعیت', Flame],
                  ].map(([value, label, Icon]: any) => (
                    <div key={label} className="neo-card rounded-[2rem] p-5">
                      <Icon className="mb-3 text-hell-gold" size={22} />
                      <div className="text-2xl font-black">{value}</div>
                      <div className="mt-1 text-sm text-white/45">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_340px]">
          <div>
            <Reveal>
              <div className="mb-7 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-4xl font-black">
                  <BookOpen className="text-hell-gold" />
                  چپترها
                </h2>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/50">
                  {manga.chapters?.length || 0} چپتر
                </span>
              </div>
            </Reveal>

            <div className="grid gap-3">
              {manga.chapters?.length ? (
                manga.chapters.map((chapter, index) => (
                  <Reveal key={chapter.id} delay={index * 0.025}>
                    <div className="neo-card group flex flex-col justify-between gap-4 rounded-[1.7rem] p-4 transition hover:border-hell-violet/50 md:flex-row md:items-center">
                      <Link href={`/reader/${chapter.id}`} className="flex min-w-0 items-center gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-hell-violet/15 font-black text-hell-gold">
                          {chapter.number}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-lg group-hover:text-hell-gold">
                            {chapter.title}
                          </strong>
                          <small className="mt-1 flex items-center gap-1 text-white/40">
                            <Calendar size={13} />
                            {chapter.createdAt ? toPersianDate(chapter.createdAt) : 'تاریخ نامشخص'}
                          </small>
                        </span>
                      </Link>

                      <div className="flex shrink-0 gap-2">
                        {chapter.pdfUrl ? (
                          <a href={chapter.pdfUrl} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm">
                              <Download size={16} />
                              <span className="mr-2">PDF</span>
                            </Button>
                          </a>
                        ) : null}

                        {chapter.zipUrl ? (
                          <a href={chapter.zipUrl} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm">
                              <Download size={16} />
                              <span className="mr-2">ZIP</span>
                            </Button>
                          </a>
                        ) : null}

                        <Link href={`/reader/${chapter.id}`}>
                          <Button size="sm">
                            خواندن
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))
              ) : (
                <Card className="rounded-[2rem] p-8 text-center text-white/45">
                  هنوز چپتری برای این مانهوا ثبت نشده.
                </Card>
              )}
            </div>
          </div>

          <Reveal delay={0.12}>
            <aside className="grid gap-5 lg:sticky lg:top-24">
              <div className="neo-card rounded-[2rem] p-6">
                <div className="mb-4 flex items-center gap-2 text-hell-gold">
                  <Tag />
                  <h3 className="text-xl font-black text-white">تگ‌ها</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {manga.tags?.length ? (
                    manga.tags.map((tag) => (
                      <Badge key={tag.id} className="bg-white/10">
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-white/45">تگی ثبت نشده.</p>
                  )}
                </div>
              </div>

              <div className="neo-card rounded-[2rem] p-6">
                <div className="mb-4 flex items-center gap-2 text-hell-red">
                  <Star />
                  <h3 className="text-xl font-black text-white">اطلاعات سریع</h3>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/45">Slug</span>
                    <span className="font-bold">{manga.slug}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/45">وضعیت</span>
                    <span className="font-bold">{manga.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/45">کامنت‌ها</span>
                    <span className="font-bold">{manga._count?.comments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">آخرین آپدیت</span>
                    <span className="font-bold">{toPersianDate(manga.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <Link href="/manga">
                <ProButton variant="secondary" className="w-full">
                  بازگشت به کتابخانه
                </ProButton>
              </Link>
            </aside>
          </Reveal>
        </section>
      </main>
    </AppShell>
  );
}
