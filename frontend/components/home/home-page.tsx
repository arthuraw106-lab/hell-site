'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Flame,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Vote,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/effects/reveal';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProButton } from '@/components/ui/pro-button';
import { apiGet, apiPost } from '@/lib/api';
import type { Manga, Paginated } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';
import { HomeMangaCard } from './home-manga-card';
import { StoryStrip } from './story-strip';

type PollProject = {
  id: string;
  title: string;
  description: string;
  cover?: string | null;
  _count: {
    votes: number;
  };
};

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manga', 'home-stage-4'],
    queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 10 }),
  });

  const { data: popular = [] } = useQuery({
    queryKey: ['manga', 'popular-stage-4'],
    queryFn: () => apiGet<Manga[]>('/manga/popular'),
  });

  const { data: adminFeatured } = useQuery({
    queryKey: ['home-featured-manga'],
    queryFn: () => apiGet<Manga | null>('/site/home-featured-manga'),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['polls', 'home-preview'],
    queryFn: () => apiGet<PollProject[]>('/polls'),
  });

  const mangas = data?.items || [];
  const featured = adminFeatured || popular[0] || mangas[0];
  const secondaryFeatured = popular[1] || mangas[1] || featured;
  const latestChapters = mangas.flatMap((manga) =>
    (manga.chapters || []).slice(0, 2).map((chapter) => ({
      manga,
      chapter,
    })),
  );

  return (
    <AppShell>
      <main className="relative z-10">
        <section className="hero-grid relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050509]/30 to-[#050509]" />

          <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.08fr_.92fr]">
            <Reveal>
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hell-violet/30 bg-hell-violet/12 px-4 py-2 text-sm font-black text-violet-100 shadow-violet">
                  <Sparkles size={16} />
                  پلتفرم حرفه‌ای خواندن مانهوا
                </div>

                <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl lg:text-8xl">
                  دنیای <span className="text-gradient">تاریک و جذاب</span> مانهواها
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-9 text-white/62">
                  تازه‌ترین مانهواها، چپترهای جدید، خواندن آنلاین، چت، استوری، رأی‌گیری پروژه‌ها و پنل مدیریت حرفه‌ای؛ همه در یک جهان.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/manga">
                    <ProButton>
                      <BookOpen size={18} />
                      شروع خواندن
                    </ProButton>
                  </Link>

                  {featured?.chapters?.[0] ? (
                    <Link href={`/reader/${featured.chapters[0].id}`}>
                      <ProButton variant="secondary">
                        <Play size={18} />
                        ادامه محبوب‌ترین
                      </ProButton>
                    </Link>
                  ) : null}
                </div>

                <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                  {[
                    ['مانهوا', `${data?.meta?.total || mangas.length}+`, Flame],
                    ['چپتر جدید', `${latestChapters.length}+`, Zap],
                    ['سیستم زنده', 'Real-time', MessageCircle],
                  ].map(([label, value, Icon]: any) => (
                    <div key={label} className="neo-card rounded-3xl p-4">
                      <Icon className="mb-3 text-hell-gold" size={22} />
                      <div className="text-2xl font-black">{value}</div>
                      <div className="mt-1 text-sm text-white/45">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="relative mx-auto w-full max-w-[540px]">
                              <div
                                className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-hell-violet/30 via-hell-red/22 to-hell-gold/10 blur-3xl animate-float-slow"
                                style={{ willChange: 'transform' }}
                              />

                              <div className="neo-card floaty relative rounded-[2.5rem] p-4">
                  <div className="overflow-hidden rounded-[2rem]">
                    <img
                      src={featured?.cover || getImageFallback(featured?.title || 'Hell Manhwa')}
                      alt={featured?.title || 'Hell Manhwa'}
                      loading="lazy" className="h-[600px] w-full object-cover"
                    />
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-hell-gold">
                        <Crown size={18} />
                        <span className="text-sm font-black">Featured</span>
                      </div>
                      <Badge className="bg-hell-red/20 text-red-100">{featured?.status || 'ONGOING'}</Badge>
                    </div>
                    <h2 className="text-2xl font-black">{featured?.title || 'هل مانهوا'}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/62">
                      {featured?.description || 'تجربه خواندن مانهوا با طراحی حرفه‌ای'}
                    </p>
                  </div>
                </div>

                <div
                                  className="absolute -right-8 top-20 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl animate-floaty-icon-left"
                                >
                                  <Flame className="text-hell-red" />
                                </div>

                                <div
                                  className="absolute -left-10 bottom-28 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl animate-floaty-icon-right"
                                >
                                  <Zap className="text-hell-gold" />
                                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5">
          <StoryStrip />
        </div>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <Reveal>
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-hell-gold">
                  <TrendingUp />
                  <span className="font-black">ترند امروز</span>
                </div>
                <h2 className="text-4xl font-black md:text-5xl">مانهواهای تازه و داغ</h2>
              </div>

              <Link href="/manga" className="group inline-flex items-center gap-2 text-white/60 transition hover:text-white">
                مشاهده کتابخانه
                <ArrowLeft className="transition group-hover:-translate-x-1" size={18} />
              </Link>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="h-[420px] rounded-[2rem] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {mangas.map((manga, index) => (
                <HomeMangaCard key={manga.id} manga={manga} index={index} />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_420px]">
          <Reveal>
            <div className="neo-card rounded-[2.5rem] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-hell-cyan">
                    <Zap size={19} />
                    <span className="font-black">آخرین چپترها</span>
                  </div>
                  <h2 className="text-3xl font-black">به‌روزرسانی‌های جدید</h2>
                </div>
                <Link href="/manga" className="text-sm font-bold text-white/45 hover:text-white">
                  همه
                </Link>
              </div>

              <div className="grid gap-3">
                {latestChapters.length ? (
                  latestChapters.slice(0, 8).map(({ manga, chapter }) => (
                    <Link
                      key={`${manga.id}-${chapter.id}`}
                      href={`/reader/${chapter.id}`}
                      className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-hell-cyan/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={manga.cover || getImageFallback(manga.title)}
                          alt={manga.title}
                          loading="lazy" className="h-16 w-12 rounded-2xl object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate font-black group-hover:text-hell-gold">{manga.title}</h3>
                          <p className="mt-1 truncate text-sm text-white/45">
                            چپتر {chapter.number}: {chapter.title}
                          </p>
                        </div>
                      </div>
                      <ArrowLeft size={18} className="shrink-0 text-white/35 transition group-hover:-translate-x-1 group-hover:text-white" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-3xl bg-white/[0.04] p-5 text-white/45">هنوز چپتری ثبت نشده.</div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-6">
              <div className="neo-card rounded-[2.5rem] p-6">
                <div className="mb-5 flex items-center gap-2 text-hell-gold">
                  <Crown />
                  <h2 className="text-2xl font-black text-white">انتخاب ویژه</h2>
                </div>

                {secondaryFeatured ? (
                  <Link href={`/manga/${secondaryFeatured.slug}`} className="group block">
                    <img
                      src={secondaryFeatured.cover || getImageFallback(secondaryFeatured.title)}
                      alt={secondaryFeatured.title}
                      loading="lazy" className="h-64 w-full rounded-[2rem] object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <h3 className="mt-4 text-2xl font-black group-hover:text-hell-gold">{secondaryFeatured.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-white/52">{secondaryFeatured.description}</p>
                  </Link>
                ) : (
                  <p className="text-white/45">موردی برای نمایش نیست.</p>
                )}
              </div>

              <div className="neo-card rounded-[2.5rem] p-6">
                <div className="mb-5 flex items-center gap-2 text-hell-red">
                  <Vote />
                  <h2 className="text-2xl font-black text-white">رأی‌گیری ترجمه</h2>
                </div>

                <div className="grid gap-3">
                  {polls.slice(0, 3).map((poll) => (
                    <div key={poll.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <h3 className="font-black">{poll.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">{poll.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-white/40">{poll._count.votes} رأی</span>
                        <button
                          className="rounded-xl bg-hell-red px-3 py-2 text-xs font-black"
                          onClick={async () => {
                            await apiPost(`/polls/${poll.id}/vote`);
                            window.location.reload();
                          }}
                        >
                          رأی می‌دم
                        </button>
                      </div>
                    </div>
                  ))}

                  {!polls.length ? <p className="text-white/45">فعلاً رأی‌گیری فعالی نیست.</p> : null}
                </div>

                <Link href="/polls" className="mt-4 inline-flex text-sm font-bold text-hell-gold">
                  رفتن به صفحه رأی‌گیری
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['امنیت و نقش‌ها', 'JWT، Refresh Token، RBAC و محافظت APIها', ShieldCheck],
              ['چت و جامعه', 'چت زنده، استوری و بات رجیس برای تعامل بیشتر', MessageCircle],
              ['جستجو و رشد', 'ساختار آماده برای SEO، فیلتر و رشد محتوا', Search],
            ].map(([title, text, Icon]: any, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <div className="neo-card rounded-[2rem] p-6">
                  <Icon className="mb-5 text-hell-gold" size={30} />
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-3 leading-7 text-white/55">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
