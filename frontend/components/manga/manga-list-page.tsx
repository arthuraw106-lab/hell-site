'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet } from '@/lib/api';
import type { Manga, Paginated } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';

export function MangaListPage() {
 const search = useSearchParams();
 const q = search.get('q') ?? '';
 const { data } = useQuery({
 queryKey: ['manga', 'list', q],
 queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 50, q: q || undefined }),
 });

 const mangas = data?.items ?? [];

 return (
 <AppShell>
 <h1 className="mb-4 text-xl font-black">کتابخانه مانهوا{q ? ` — ${q}` : ''}</h1>
 {mangas.length === 0 ? (
 <p className="text-hell-muted">مانهوایی پیدا نشد.</p>
 ) : (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
 {mangas.map((m) => (
 <Link key={m.id} href={`/manga/${m.slug}`} className="group overflow-hidden rounded-lg border border-hell-border bg-hell-card">
 <img
 src={m.cover ?? getImageFallback(m.title)}
 alt={m.title}
 className="h-44 w-full object-cover"
 loading="lazy"
 />
 <div className="p-2">
 <h2 className="truncate text-sm font-bold group-hover:text-hell-violet">{m.title}</h2>
 <p className="truncate text-[10px] text-hell-muted">{m.status}</p>
 </div>
 </Link>
 ))}
 </div>
 )}
 </AppShell>
 );
}