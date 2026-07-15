'use client';

import { useQuery } from '@tanstack/react-query';
import { Filter, Library, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Reveal } from '@/components/effects/reveal';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProButton } from '@/components/ui/pro-button';
import { apiGet } from '@/lib/api';
import type { Manga, Paginated } from '@/lib/types';
import { MangaCard } from './manga-card';

const statusOptions = [
  { label: 'همه وضعیت‌ها', value: '' },
  { label: 'در حال انتشار', value: 'ONGOING' },
  { label: 'کامل شده', value: 'COMPLETED' },
  { label: 'متوقف', value: 'HIATUS' },
  { label: 'به‌زودی', value: 'UPCOMING' },
];

const quickGenres = ['اکشن', 'فانتزی', 'درام', 'رازآلود', 'رمانتیک', 'کمدی'];

export function MangaListPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular' | 'chapters'>('latest');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['manga', 'library-stage-5', debouncedQ, selectedGenre],
    queryFn: () =>
      apiGet<Paginated<Manga>>('/manga', {
        page: 1,
        limit: 100,
        q: debouncedQ || undefined,
        genre: selectedGenre ? selectedGenre.toLowerCase() : undefined,
      }),
  });

  const mangas = data?.items || [];

  const filtered = useMemo(() => {
    let items = [...mangas];

    if (selectedStatus) {
      items = items.filter((manga) => manga.status === selectedStatus);
    }

    if (sort === 'popular') {
      items.sort((a, b) => (b._count?.likes || 0) - (a._count?.likes || 0));
    }

    if (sort === 'chapters') {
      items.sort((a, b) => (b.chapters?.length || 0) - (a.chapters?.length || 0));
    }

    if (sort === 'latest') {
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return items;
  }, [mangas, selectedStatus, sort]);

  function resetFilters() {
    setQ('');
    setDebouncedQ('');
    setSelectedGenre('');
    setSelectedStatus('');
    setSort('latest');
  }

  return (
    <AppShell>
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <Reveal>
          <section className="neo-card relative mb-8 overflow-hidden rounded-[2.5rem] p-7 md:p-10">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-hell-violet/20 blur-3xl" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-hell-red/14 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hell-violet/25 bg-hell-violet/12 px-4 py-2 text-sm font-black text-violet-100">
                  <Sparkles size={16} />
                  کتابخانه حرفه‌ای
                </div>

                <h1 className="text-5xl font-black leading-tight md:text-7xl">
                  آرشیو <span className="text-gradient">مانهواها</span>
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
                  بین مانهواها جستجو کن، فیلتر بزن و سریع برو سراغ چپترهای جدید.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-3 flex items-center gap-2 text-white/50">
                  <Search size={18} />
                  <span className="text-sm font-bold">جستجوی سریع</span>
                </div>
                <div className="relative">
                  <Search className="absolute right-4 top-3.5 text-white/35" size={18} />
                  <Input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="اسم مانهوا رو بنویس..."
                    className="h-12 pr-11"
                  />
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mb-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          <Reveal>
            <aside className="neo-card rounded-[2rem] p-5 lg:sticky lg:top-24">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-hell-gold" />
                  <h2 className="font-black">فیلترها</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl bg-white/10 p-2 text-white/50 transition hover:text-white"
                  aria-label="حذف فیلترها"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/50">مرتب‌سازی</label>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as 'latest' | 'popular' | 'chapters')}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none"
                  >
                    <option value="latest">جدیدترین</option>
                    <option value="popular">محبوب‌ترین</option>
                    <option value="chapters">بیشترین چپتر</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/50">وضعیت</label>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/50">ژانرهای سریع</label>
                  <div className="flex flex-wrap gap-2">
                    {quickGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                        className={
                          selectedGenre === genre
                            ? 'rounded-full bg-hell-red px-3 py-2 text-xs font-black text-white'
                            : 'rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/55 transition hover:bg-white/15 hover:text-white'
                        }
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-hell-cyan/20 bg-hell-cyan/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-hell-cyan">
                    <SlidersHorizontal size={17} />
                    <span className="text-sm font-black">نتایج</span>
                  </div>
                  <p className="text-2xl font-black">{filtered.length}</p>
                  <p className="mt-1 text-xs text-white/45">مانهوا پیدا شد</p>
                </div>
              </div>
            </aside>
          </Reveal>

          <div>
            <Reveal>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Library className="text-hell-gold" />
                  <span className="font-bold">نمایش کتابخانه</span>
                </div>

                <LinkLikeButton />
              </div>
            </Reveal>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="h-[420px] rounded-[2rem] skeleton" />
                ))}
              </div>
            ) : filtered.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.map((manga, index) => (
                  <MangaCard key={manga.id} manga={manga} index={index} />
                ))}
              </div>
            ) : (
              <Card className="rounded-[2rem] p-10 text-center">
                <Search className="mx-auto mb-4 text-white/30" size={42} />
                <h2 className="text-2xl font-black">چیزی پیدا نشد</h2>
                <p className="mt-3 text-white/45">فیلترها یا عبارت جستجو رو تغییر بده.</p>
                <div className="mt-5">
                  <ProButton variant="secondary" onClick={resetFilters}>
                    حذف فیلترها
                  </ProButton>
                </div>
              </Card>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function LinkLikeButton() {
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className="hidden rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/50 md:inline-flex"
    >
      فیلتر پیشرفته‌تر در مرحله‌های بعد
    </a>
  );
}
