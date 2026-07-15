'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Bookmark, Calendar, ImagePlus, Save, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadBox } from '@/components/upload/upload-box';
import { apiGet, apiPatch } from '@/lib/api';
import type { User } from '@/lib/types';
import { toPersianDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

type ProfileMe = User & {
  readingHistory?: {
    id: string;
    updatedAt: string;
    manga: {
      id: string;
      slug: string;
      title: string;
      cover?: string | null;
    };
    chapter: {
      id: string;
      number: number;
      title: string;
    };
  }[];
  bookmarks?: {
    id: string;
    manga: {
      id: string;
      slug: string;
      title: string;
      cover?: string | null;
    };
  }[];
};

export function ProfilePage() {
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatar: '',
  });

  const [message, setMessage] = useState('');

  const { data: me, isLoading, refetch } = useQuery({
    queryKey: ['me-profile'],
    queryFn: () => apiGet<ProfileMe>('/users/me'),
  });

  useEffect(() => {
    if (me) {
      setUser(me);
      setForm({
        username: me.username || '',
        displayName: me.displayName || '',
        bio: me.bio || '',
        avatar: me.avatar || '',
      });
    }
  }, [me, setUser]);

  const updateProfile = useMutation({
    mutationFn: () => apiPatch<User>('/users/me', form),
    onSuccess: async (user) => {
      setUser(user);
      setMessage('پروفایل با موفقیت ذخیره شد.');
      await refetch();
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'خطا در ذخیره پروفایل');
    },
  });

  return (
    <AppShell>
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <section className="neo-card mb-8 overflow-hidden rounded-[2.5rem] p-7 md:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hell-violet/25 bg-hell-violet/12 px-4 py-2 text-sm font-black text-violet-100">
                <UserRound size={16} />
                حساب کاربری
              </div>
              <h1 className="text-5xl font-black md:text-7xl">
                پروفایل <span className="text-gradient">من</span>
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-white/55">
                اطلاعات کاربری، تصویر پروفایل، بیو، علاقه‌مندی‌ها و تاریخچه خواندن را مدیریت کن.
              </p>
            </div>

            {me ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 text-sm text-white/55">
                نقش فعلی: <strong className="text-hell-gold">{me.role}</strong>
              </div>
            ) : null}
          </div>
        </section>

        {isLoading ? (
          <Card className="h-96 rounded-[2.5rem] skeleton" />
        ) : me ? (
          <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
            <Card className="neo-card rounded-[2.5rem] p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06]">
                  {form.avatar ? (
                    <img src={form.avatar} alt={form.username || 'avatar'} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="text-white/35" size={38} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black">{form.displayName || form.username}</h2>
                  <p className="mt-1 truncate text-sm text-white/45">@{form.username}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    <Calendar size={14} />
                    عضویت: {toPersianDate(me.createdAt)}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-dashed border-hell-gold/30 bg-hell-gold/10 p-4">
                <div className="mb-3 flex items-center gap-2 text-hell-gold">
                  <ImagePlus size={18} />
                  <strong>آپلود مستقیم عکس پروفایل</strong>
                </div>

                <UploadBox
                  label="انتخاب و آپلود تصویر پروفایل"
                  onUploaded={(upload) => {
                    setForm((prev) => ({ ...prev, avatar: upload.url }));
                    setMessage('عکس آپلود شد. برای ثبت نهایی، ذخیره پروفایل را بزن.');
                  }}
                />

                {form.avatar ? (
                  <p className="mt-3 break-all text-xs leading-6 text-white/45">
                    آدرس ذخیره‌شده: {form.avatar}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4">
                <Input
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  placeholder="نام کاربری"
                />

                <Input
                  value={form.displayName}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                  placeholder="نام نمایشی"
                />

                <Textarea
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  placeholder="بیو"
                  className="min-h-32"
                />

                {message ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sm leading-7 text-white/65">
                    {message}
                  </div>
                ) : null}

                <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                  <Save size={16} />
                  <span className="mr-2">{updateProfile.isPending ? 'در حال ذخیره...' : 'ذخیره پروفایل'}</span>
                </Button>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="neo-card rounded-[2.5rem] p-6">
                <h2 className="mb-4 text-2xl font-black">آخرین خوانده‌شده‌ها</h2>

                <div className="grid gap-3">
                  {me.readingHistory?.length ? (
                    me.readingHistory.map((item) => (
                      <Link
                        key={item.id}
                        href={`/reader/${item.chapter.id}`}
                        className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-hell-violet/40 hover:bg-white/[0.07]"
                      >
                        <div className="font-black group-hover:text-hell-gold">{item.manga.title}</div>
                        <p className="mt-2 text-sm text-white/50">
                          چپتر {item.chapter.number}: {item.chapter.title}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white/[0.04] p-5 text-white/45">هنوز چیزی نخواندی.</p>
                  )}
                </div>
              </Card>

              <Card className="neo-card rounded-[2.5rem] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
                  <Bookmark className="text-hell-gold" />
                  علاقه‌مندی‌ها
                </h2>

                <div className="grid gap-3">
                  {me.bookmarks?.length ? (
                    me.bookmarks.map((item) => (
                      <Link
                        key={item.id}
                        href={`/manga/${item.manga.slug}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-bold transition hover:border-hell-red/40 hover:bg-white/[0.07]"
                      >
                        {item.manga.title}
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white/[0.04] p-5 text-white/45">لیست علاقه‌مندی خالی است.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="rounded-[2.5rem] p-8 text-center text-white/60">
            برای دیدن پروفایل باید وارد حساب شوی.
            <div className="mt-5">
              <Link href="/auth">
                <Button>ورود / ثبت‌نام</Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </AppShell>
  );
}
