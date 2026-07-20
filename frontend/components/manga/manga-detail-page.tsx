'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet, apiPost } from '@/lib/api';
import type { Chapter, Manga } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export function MangaDetailPage({ slug }: { slug: string }) {
 const qc = useQueryClient();
 const user = useAuthStore((s) => s.user);

 const { data: manga } = useQuery({
 queryKey: ['manga', slug],
 queryFn: () => apiGet<Manga>(`/manga/${slug}`),
 enabled: Boolean(slug),
 });

 const bookmarkMut = useMutation({
 mutationFn: (add: boolean) => apiPost(`/manga/${slug}/${add ? 'bookmark' : 'unbookmark'}`),
 onSuccess: () => qc.invalidateQueries({ queryKey: ['manga', slug] }),
 });

 if (!manga) return <AppShell><p className="text-hell-muted">بارگذاری...</p></AppShell>;

 return (
 <AppShell>
 {/* Header */}
 <section className="mb-6 flex flex-col gap-4 md:flex-row">
 <img
 src={manga.cover ?? getImageFallback(manga.title)}
 alt={manga.title}
 className="h-60 w-44 rounded-xl border border-hell-border object-cover"
 loading="lazy"
 />
 <div className="flex-1">
 <h1 className="text-2xl font-black">{manga.title}</h1>
 {manga.altTitle ? <p className="text-sm text-hell-muted">{manga.altTitle}</p> : null}
 <div className="mt-2 flex flex-wrap gap-1">
 {manga.genres.map((g) => (
 <Link key={g.id} href={`/manga?genre=${g.slug}`} className="rounded-md bg-hell-purple/30 px-2 py-0.5 text-xs text-hell-light hover:bg-hell-purple/50">
 {g.name}
 </Link>
 ))}
 </div>
 <p className="mt-3 text-sm leading-7 text-hell-muted">{manga.description}</p>
 <div className="mt-3 flex items-center gap-2">
 <span className="rounded-md bg-hell-violet/40 px-2 py-0.5 text-xs font-bold text-hell-light">{manga.status}</span>
 {user ? (
 <button
 onClick={() => bookmarkMut.mutate(!manga._count?.bookmarks)}
 className="flex items-center gap-1 rounded-md border border-hell-border bg-hell-card px-2 py-1 text-xs hover:bg-hell-purple/30"
 >
 <Bookmark size={14} /> بوکمارک
 </button>
 ) : null}
 </div>
 </div>
 </section>

 {/* Chapters */}
 <section>
 <h2 className="mb-3 text-lg font-black">چپترها</h2>
 {!manga.chapters.length ? (
 <p className="text-sm text-hell-muted">چپتری ثبت نشده.</p>
 ) : (
 <div className="space-y-1">
 {manga.chapters.map((c: Chapter) => (
 <Link
 key={c.id}
 href={`/reader/${c.id}`}
 className="flex items-center justify-between rounded-lg border border-hell-border bg-hell-card px-3 py-2 transition-colors hover:border-hell-violet"
 >
 <div className="min-w-0">
 <span className="text-sm font-bold">چپتر {c.number}</span>
 <span className="mr-2 text-xs text-hell-muted">: {c.title}</span>
 </div>
 <span className="text-[10px] text-hell-muted">{c.views} بازدید</span>
 </Link>
 ))}
 </div>
 )}
 </section>
 </AppShell>
 );
}