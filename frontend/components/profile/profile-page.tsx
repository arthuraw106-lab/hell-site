'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { apiGet } from '@/lib/api';
import { Manga, User } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export function ProfilePage() {
 const user = useAuthStore((s) => s.user);
 const qc = useQueryClient();

 if (!user) {
 return (
 <AppShell>
 <p className="text-hell-muted">برای دیدن پروفایل <Link href="/auth" className="text-hell-violet">وارد شوید</Link>.</p>
 </AppShell>
 );
 }

 return (
 <AppShell>
 <ProfileContent user={user} />
 </AppShell>
 );
}

function ProfileContent({ user }: { user: User }) {
 const { data: bookmarks } = useQuery({
 queryKey: ['user', 'bookmarks'],
 queryFn: () => apiGet<{ manga: Manga }[]>('/users/me/bookmarks'),
 });

 return (
 <div className="mx-auto max-w-3xl space-y-4">
 {/* Profile header */}
 <div className="card flex items-center gap-4 p-5">
 <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-hell-violet">
 {user.avatar ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" /> : <span className="text-2xl font-black">{user.username[0]}</span>}
 </div>
 <div>
 <h1 className="text-xl font-black">{user.displayName || user.username}</h1>
 <p className="text-sm text-hell-muted">{user.email || user.username}</p>
 <span className="mt-1 inline-block rounded-md bg-hell-purple/30 px-2 py-0.5 text-xs text-hell-light">{user.role}</span>
 </div>
 </div>

 {/* Bookmarks */}
 <div>
 <h2 className="mb-2 flex items-center gap-2 text-lg font-black"><Bookmark size={18} className="text-hell-violet" /> بوکمارک‌ها</h2>
 {bookmarks && bookmarks.length > 0 ? (
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
 {bookmarks.map(({ manga }) => (
 <Link key={manga.id} href={`/manga/${manga.slug}`} className="overflow-hidden rounded-lg border border-hell-border bg-hell-card">
 {manga.cover ? (
 <img src={manga.cover} alt={manga.title} className="h-32 w-full object-cover" loading="lazy" />
 ) : (
 <div className="grid h-32 w-full place-items-center bg-hell-purple/20 text-xs text-hell-muted">{manga.title}</div>
 )}
 <div className="p-1.5">
 <h3 className="truncate text-xs font-bold">{manga.title}</h3>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <p className="text-sm text-hell-muted">بوکمارکی ندارید.</p>
 )}
 </div>
 </div>
 );
}