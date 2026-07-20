'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Eye,
  Heart,
  ImageIcon,
  Maximize2,
  MessageCircle,
  Minimize2,
  Moon,
  Send,
  Settings2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Reveal } from '@/components/effects/reveal';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProButton } from '@/components/ui/pro-button';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost } from '@/lib/api';
import type { Chapter, Comment, Manga } from '@/lib/types';
import { getImageFallback, toPersianDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

type ReaderMode = 'comfortable' | 'wide' | 'focus';

export function ReaderPage({ chapterId }: { chapterId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [commentBody, setCommentBody] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [readerMode, setReaderMode] = useState<ReaderMode>('comfortable');
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => apiGet<Chapter>(`/manga/chapters/${chapterId}/read`),
  });

  const { data: manga } = useQuery({
    enabled: Boolean(chapter?.manga?.slug),
    queryKey: ['manga', 'reader-detail', chapter?.manga?.slug],
    queryFn: () => apiGet<Manga>(`/manga/${chapter?.manga?.slug}`),
  });

  const { data: comments = [] } = useQuery({
    enabled: Boolean(chapterId),
    queryKey: ['comments', chapterId],
    queryFn: () => apiGet<Comment[]>(`/comments/chapter/${chapterId}`),
  });

  const chaptersAsc = useMemo(() => {
    return [...(manga?.chapters || [])].sort((a, b) => a.number - b.number);
  }, [manga?.chapters]);

  const currentIndex = chaptersAsc.findIndex((item) => item.id === chapterId);
  const previousChapter = currentIndex > 0 ? chaptersAsc[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chaptersAsc.length - 1 ? chaptersAsc[currentIndex + 1] : null;

  const createComment = useMutation({
    mutationFn: () =>
      apiPost('/comments', {
        mangaId: chapter?.mangaId,
        chapterId,
        body: commentBody,
        spoiler,
      }),
    onSuccess: () => {
      setCommentBody('');
      setSpoiler(false);
      queryClient.invalidateQueries({ queryKey: ['comments', chapterId] });
    },
  });

  const likeChapter = useMutation({
    mutationFn: () => apiPost(`/manga/chapters/${chapterId}/like`),
  });

  const maxWidthClass =
    readerMode === 'wide'
      ? 'max-w-6xl'
      : readerMode === 'focus'
        ? 'max-w-3xl'
        : 'max-w-4xl';

  if (isLoading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-5xl px-5 py-10">
          <Card className="h-[800px] rounded-[2.5rem] skeleton" />
        </main>
      </AppShell>
    );
  }

  if (!chapter) {
    return (
      <AppShell>
        <main className="mx-auto max-w-5xl px-5 py-10">
          <Card className="rounded-[2rem] p-8 text-center">
            <h1 className="text-2xl font-black">چپتر پیدا نشد.</h1>
            <Link href="/manga" className="mt-4 inline-block text-hell-gold">
              بازگشت به کتابخانه
            </Link>
          </Card>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="relative z-10 bg-[#030306]">
        <section className="sticky top-20 z-40 border-b border-white/10 bg-[#030306]/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href={chapter.manga?.slug ? `/manga/${chapter.manga.slug}` : '/manga'}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/60 transition hover:text-white"
                aria-label="بازگشت"
              >
                <ArrowRight size={18} />
              </Link>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className="bg-hell-violet/15 text-violet-100">
                    چپتر {chapter.number}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Eye size={13} />
                    {chapter.views} بازدید
                  </span>
                </div>

                <h1 className="truncate text-lg font-black md:text-2xl">
                  {chapter.manga?.title} — {chapter.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {previousChapter ? (
                <Link href={`/reader/${previousChapter.id}`}>
                  <Button variant="secondary" size="sm">
                    <ArrowRight size={16} />
                    <span className="mr-2">قبلی</span>
                  </Button>
                </Link>
              ) : null}

              {nextChapter ? (
                <Link href={`/reader/${nextChapter.id}`}>
                  <Button variant="secondary" size="sm">
                    <span className="ml-2">بعدی</span>
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
              ) : null}

              <Button variant="secondary" size="sm" onClick={() => likeChapter.mutate()} disabled={likeChapter.isPending}>
                <Heart size={16} />
                <span className="mr-2">لایک</span>
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setShowSettings((value) => !value)}>
                <Settings2 size={16} />
                <span className="mr-2">تنظیمات</span>
                <ChevronDown size={14} className={showSettings ? 'rotate-180 transition' : 'transition'} />
              </Button>
            </div>
          </div>

          {showSettings ? (
            <div className="border-t border-white/10 px-5 py-4">
              <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setReaderMode('comfortable')}
                  className={readerMode === 'comfortable' ? 'rounded-2xl bg-hell-red px-4 py-3 font-black' : 'rounded-2xl bg-white/[0.055] px-4 py-3 text-white/60'}
                >
                  حالت راحت
                </button>

                <button
                  type="button"
                  onClick={() => setReaderMode('wide')}
                  className={readerMode === 'wide' ? 'rounded-2xl bg-hell-red px-4 py-3 font-black' : 'rounded-2xl bg-white/[0.055] px-4 py-3 text-white/60'}
                >
                  <Maximize2 className="ml-2 inline" size={16} />
                  عریض
                </button>

                <button
                  type="button"
                  onClick={() => setReaderMode('focus')}
                  className={readerMode === 'focus' ? 'rounded-2xl bg-hell-red px-4 py-3 font-black' : 'rounded-2xl bg-white/[0.055] px-4 py-3 text-white/60'}
                >
                  <Minimize2 className="ml-2 inline" size={16} />
                  تمرکز
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 opacity-20">
            <img
              src={chapter.manga?.cover || getImageFallback(chapter.manga?.title || 'chapter')}
              alt={chapter.manga?.title || chapter.title}
              className="h-full w-full object-cover blur-xl"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030306]/50 via-[#030306]/90 to-[#030306]" />

          <div className="relative mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1fr_320px]">
            <Reveal>
              <div>
                <div className="mb-4 flex items-center gap-2 text-hell-gold">
                  <Sparkles size={18} />
                  <span className="font-black">Reader Mode</span>
                </div>

                <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                  {chapter.manga?.title}
                </h2>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/55">
                  چپتر {chapter.number}: {chapter.title}
                </p>

                {chapter.summary ? (
                  <p className="mt-5 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-5 leading-8 text-white/58">
                    {chapter.summary}
                  </p>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="neo-card rounded-[2rem] p-5">
                <div className="mb-4 flex items-center gap-2 text-hell-cyan">
                  <ImageIcon size={18} />
                  <span className="font-black">اطلاعات چپتر</span>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/45">تعداد صفحات</span>
                    <span className="font-black">{chapter.pages.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/45">بازدید</span>
                    <span className="font-black">{chapter.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">تاریخ</span>
                    <span className="font-black">{toPersianDate(chapter.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-0 py-6 md:px-5">
          <div className={`mx-auto ${maxWidthClass}`}>
            <div className="grid gap-0">
              {chapter.pages.map((page, index) => (
                <Reveal key={`${page}-${index}`} delay={Math.min(index * 0.015, 0.18)}>
                  <div className="bg-black leading-none">
                    <img
                      src={page}
                      alt={`${chapter.title} page ${index + 1}`}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      className="mx-auto block w-full object-contain align-top"
                    />
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 flex flex-col justify-between gap-3 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 md:flex-row md:items-center">
              {previousChapter ? (
                <Link href={`/reader/${previousChapter.id}`}>
                  <ProButton variant="secondary" className="w-full md:w-auto">
                    <ArrowRight size={18} />
                    چپتر قبلی
                  </ProButton>
                </Link>
              ) : (
                <div />
              )}

              <Link href={chapter.manga?.slug ? `/manga/${chapter.manga.slug}` : '/manga'}>
                <ProButton variant="ghost" className="w-full md:w-auto">
                  <BookOpen size={18} />
                  صفحه مانهوا
                </ProButton>
              </Link>

              {nextChapter ? (
                <Link href={`/reader/${nextChapter.id}`}>
                  <ProButton className="w-full md:w-auto">
                    چپتر بعدی
                    <ArrowLeft size={18} />
                  </ProButton>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-16">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-3xl font-black">
              <MessageCircle className="text-hell-gold" />
              کامنت‌ها
            </h2>

            <button
              type="button"
              onClick={() => setShowComments((value) => !value)}
              className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/60 transition hover:text-white"
            >
              {showComments ? 'بستن' : 'نمایش'}
            </button>
          </div>

          {showComments ? (
            <>
              <Card className="neo-card mb-6 rounded-[2rem] p-5">
                {user ? (
                  <div className="grid gap-0">
                    <Textarea
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      placeholder="نظرت درباره این چپتر رو بنویس..."
                      className="min-h-32"
                    />

                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-white/55">
                        <input
                          type="checkbox"
                          checked={spoiler}
                          onChange={(event) => setSpoiler(event.target.checked)}
                        />
                        این کامنت اسپویلر دارد
                      </label>

                      <Button
                        onClick={() => createComment.mutate()}
                        disabled={!commentBody.trim() || createComment.isPending}
                      >
                        <Send size={16} />
                        <span className="mr-2">ارسال کامنت</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-hell-gold/20 bg-hell-gold/10 p-5">
                    <div className="mb-2 flex items-center gap-2 text-hell-gold">
                      <ShieldAlert size={18} />
                      <strong>برای ارسال کامنت وارد شو</strong>
                    </div>
                    <p className="text-sm text-white/55">خواندن کامنت‌ها آزاده، ولی برای ارسال باید حساب داشته باشی.</p>
                    <Link href="/auth" className="mt-4 inline-block">
                      <Button size="sm">ورود / ثبت‌نام</Button>
                    </Link>
                  </div>
                )}
              </Card>

              <div className="grid gap-0">
                {comments.length ? (
                  comments.map((comment) => {
                    const isRevealed = revealedSpoilers[comment.id];

                    return (
                      <Card key={comment.id} className="rounded-[2rem] p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <strong>{comment.user.displayName || comment.user.username}</strong>
                            <div className="mt-1 text-xs text-white/35">{toPersianDate(comment.createdAt)}</div>
                          </div>

                          {comment.spoiler ? (
                            <Badge className="bg-hell-red/15 text-red-100">اسپویلر</Badge>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (comment.spoiler) {
                              setRevealedSpoilers((prev) => ({ ...prev, [comment.id]: true }));
                            }
                          }}
                          className={
                            comment.spoiler && !isRevealed
                              ? 'mt-2 w-full rounded-2xl bg-white/[0.055] p-4 text-right leading-8 text-white/65 blur-sm transition hover:blur-[2px]'
                              : 'mt-2 w-full rounded-2xl bg-white/[0.035] p-4 text-right leading-8 text-white/70'
                          }
                        >
                          {comment.body}
                        </button>

                        {comment.replies?.length ? (
                          <div className="mt-4 grid gap-2 border-r border-white/10 pr-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded-2xl bg-white/[0.04] p-3">
                                <strong className="text-sm">{reply.user.username}</strong>
                                <p className="mt-2 text-sm leading-6 text-white/60">{reply.body}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </Card>
                    );
                  })
                ) : (
                  <Card className="rounded-[2rem] p-8 text-center text-white/45">
                    هنوز کامنتی ثبت نشده. اولین نفر باش 😄
                  </Card>
                )}
              </div>
            </>
          ) : null}
        </section>
      </main>
    </AppShell>
  );
}
