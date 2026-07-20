'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiGet, apiPatch } from '@/lib/api';
import type { Manga, Paginated } from '@/lib/types';
import { useToastStore } from '@/store/toast-store';

type FeaturedSetting = {
 mangaId?: string | null;
 title?: string;
 slug?: string;
};

export function FeaturedMangaAdminCard() {
 const queryClient = useQueryClient();
 const showToast = useToastStore((state) => state.showToast);
 const [mangaId, setMangaId] = useState('');

 const { data: mangaData } = useQuery({
 queryKey: ['admin-featured-manga-list'],
 queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 200 }),
 });

 const { data: setting } = useQuery({
 queryKey: ['admin-home-featured-manga'],
 queryFn: () => apiGet<FeaturedSetting>('/admin/home-featured-manga'),
 });

 useEffect(() => {
 if (setting?.mangaId) {
 setMangaId(setting.mangaId);
 }
 }, [setting?.mangaId]);

 const mutation = useMutation({
 mutationFn: () => apiPatch('/admin/home-featured-manga', { mangaId }),
 onSuccess: async () => {
 showToast({
 type: 'success',
 title: 'مانهوای صفحه اول ذخیره شد',
 });

 await queryClient.invalidateQueries({ queryKey: ['admin-home-featured-manga'] });
 await queryClient.invalidateQueries({ queryKey: ['home-featured-manga'] });
 await queryClient.invalidateQueries({ queryKey: ['manga'] });
 },
 onError: (error) => {
 showToast({
 type: 'error',
 title: 'ذخیره انجام نشد',
 message: error instanceof Error ? error.message : '',
 });
 },
 });

 const mangas = mangaData?.items || [];

 return (
 <Card className="card rounded-[2.5rem] p-6">
 <div className="mb-5 flex items-center gap-2 text-hell-light">
 <Crown />
 <div>
 <h2 className="text-2xl font-black text-white">مانهوای منتخب صفحه اول</h2>
 <p className="mt-1 text-sm text-white/45">
 ادمین می‌تواند مانهوایی که در Hero صفحه اصلی نمایش داده می‌شود را انتخاب کند.
 </p>
 </div>
 </div>

 <div className="grid gap-4 md:grid-cols-[1fr_auto]">
 <select
 value={mangaId}
 onChange={(event) => setMangaId(event.target.value)}
 className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none"
 >
 <option value="">انتخاب مانهوا</option>
 {mangas.map((manga) => (
 <option key={manga.id} value={manga.id}>
 {manga.title} - {manga.slug}
 </option>
 ))}
 </select>

 <Button disabled={!mangaId || mutation.isPending} onClick={() => mutation.mutate()}>
 <Save size={16} />
 <span className="mr-2">ذخیره</span>
 </Button>
 </div>

 {setting?.title ? (
 <p className="mt-4 rounded-2xl bg-white/[0.05] p-3 text-sm text-white/60">
 انتخاب فعلی: <strong className="text-white">{setting.title}</strong>
 </p>
 ) : null}
 </Card>
 );
}
