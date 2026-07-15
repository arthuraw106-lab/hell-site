'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, Heart, Trash2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Story } from '@/lib/types';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useToastStore } from '@/store/toast-store';

type StoryInsight = {
  viewers: {
    id: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName?: string | null;
      avatar?: string | null;
      role?: string;
    };
  }[];
  likers: {
    id: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName?: string | null;
      avatar?: string | null;
      role?: string;
    };
  }[];
  counts: {
    views: number;
    likes: number;
  };
};

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i.test(url);
}

export function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const [index, setIndex] = useState(initialIndex);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [panel, setPanel] = useState<'none' | 'views' | 'likes'>('none');

  const story = stories[index];
  const isOwner = Boolean(user?.id && story?.user?.id === user.id);

  const progressItems = useMemo(() => stories.map((item) => item.id), [stories]);

  const { data: insights } = useQuery({
    enabled: Boolean(story?.id && isOwner),
    queryKey: ['story-insights', story?.id],
    queryFn: () => apiGet<StoryInsight>(`/stories/${story.id}/insights`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/stories/${story.id}`),
    onSuccess: async () => {
      showToast({
        type: 'success',
        title: 'استوری حذف شد',
      });

      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      onClose();
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'حذف استوری ناموفق بود',
        message: error instanceof Error ? error.message : '',
      });
    },
  });

  function next() {
    setPanel('none');

    if (index < stories.length - 1) {
      setIndex(index + 1);
      return;
    }

    onClose();
  }

  function prev() {
    setPanel('none');

    if (index > 0) {
      setIndex(index - 1);
    }
  }

  async function like() {
    if (!story) return;

    try {
      await apiPost(`/stories/${story.id}/like`);
      setLiked((prevState) => ({
        ...prevState,
        [story.id]: true,
      }));
      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      await queryClient.invalidateQueries({ queryKey: ['story-insights', story.id] });
    } catch {}
  }

  useEffect(() => {
    if (!story?.id) return;

    apiPost(`/stories/${story.id}/view`).catch(() => {});
  }, [story?.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') next();
      if (event.key === 'ArrowRight') prev();
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    if (!story || panel !== 'none') return;

    const duration = isVideoUrl(story.mediaUrl) ? 12000 : 7000;
    const timer = window.setTimeout(() => {
      next();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [story?.id, index, panel]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/95 p-0 text-white backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 z-20 p-4">
        <div className="mx-auto flex max-w-2xl gap-1">
          {progressItems.map((id, itemIndex) => (
            <div key={id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className={
                  itemIndex < index
                    ? 'h-full w-full bg-white'
                    : itemIndex === index
                      ? 'h-full animate-[storyProgress_7s_linear_forwards] bg-white'
                      : 'h-full w-0 bg-white'
                }
              />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-hell-purple to-hell-violet">
              {story.user.avatar ? (
                <img src={story.user.avatar} alt={story.user.username} className="h-full w-full object-cover" />
              ) : (
                <span className="font-black">{story.user.username.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="font-black">{story.user.displayName || story.user.username}</div>
              <div className="text-xs text-white/45">استوری ۲۴ ساعته</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="بستن"
          >
            <X />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute right-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:grid"
        aria-label="قبلی"
      >
        <ChevronRight />
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute left-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:grid"
        aria-label="بعدی"
      >
        <ChevronLeft />
      </button>

      <div className="relative h-full w-full max-w-2xl overflow-hidden bg-black md:h-[88vh] md:rounded-[2.5rem] md:border md:border-white/10">
        <button type="button" onClick={prev} className="absolute bottom-0 right-0 top-0 z-10 w-1/2 md:hidden" aria-label="قبلی" />
        <button type="button" onClick={next} className="absolute bottom-0 left-0 top-0 z-10 w-1/2 md:hidden" aria-label="بعدی" />

        {story.mediaUrl ? (
          isVideoUrl(story.mediaUrl) ? (
            <video key={story.id} src={story.mediaUrl} className="h-full w-full object-contain" autoPlay controls playsInline />
          ) : (
            <img key={story.id} src={story.mediaUrl} alt={story.user.username} className="h-full w-full object-contain" />
          )
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            <p className="text-3xl font-black leading-relaxed">{story.text}</p>
          </div>
        )}

        {story.text && story.mediaUrl ? (
          <div className="absolute bottom-24 left-6 right-6 rounded-3xl bg-black/45 p-4 text-center leading-7 backdrop-blur-xl">
            {story.text}
          </div>
        ) : null}

        <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={like}
            className={liked[story.id] ? 'rounded-full bg-red-500 px-4 py-3 font-black text-white' : 'rounded-full bg-white/10 px-4 py-3 font-black text-white backdrop-blur-xl'}
          >
            <Heart className="ml-2 inline" size={18} />
            پسندیدن
          </button>

          {isOwner ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPanel(panel === 'views' ? 'none' : 'views')}
                className="rounded-full bg-white/10 px-4 py-3 font-black backdrop-blur-xl"
              >
                <Eye className="ml-2 inline" size={18} />
                {insights?.counts.views ?? story.views?.length ?? 0}
              </button>

              <button
                type="button"
                onClick={() => setPanel(panel === 'likes' ? 'none' : 'likes')}
                className="rounded-full bg-white/10 px-4 py-3 font-black backdrop-blur-xl"
              >
                <Users className="ml-2 inline" size={18} />
                {insights?.counts.likes ?? story.likes?.length ?? 0}
              </button>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  const ok = window.confirm('استوری حذف شود؟');
                  if (ok) deleteMutation.mutate();
                }}
                className="rounded-full bg-red-500/80 px-4 py-3 font-black text-white backdrop-blur-xl disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/65 backdrop-blur-xl">
              {index + 1} / {stories.length}
            </div>
          )}
        </div>

        {isOwner && panel !== 'none' ? (
          <div className="absolute bottom-24 left-5 right-5 z-30 max-h-80 overflow-y-auto rounded-[2rem] border border-white/10 bg-black/75 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <strong>{panel === 'views' ? 'بازدیدکننده‌ها' : 'لایک‌کننده‌ها'}</strong>
              <button type="button" onClick={() => setPanel('none')} className="rounded-xl bg-white/10 p-2">
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-2">
              {(panel === 'views' ? insights?.viewers : insights?.likers)?.length ? (
                (panel === 'views' ? insights?.viewers : insights?.likers)?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-hell-violet">
                      {item.user.avatar ? (
                        <img src={item.user.avatar} alt={item.user.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-black">{item.user.username.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">{item.user.displayName || item.user.username}</div>
                      <div className="text-xs text-white/40">@{item.user.username}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/10 p-4 text-center text-white/45">
                  هنوز کسی این بخش را پر نکرده.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes storyProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
