'use client';

import { useQuery } from '@tanstack/react-query';
import { Camera, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Story } from '@/lib/types';
import { CreateStoryCard } from '@/components/stories/create-story-card';
import { StoryViewer } from '@/components/stories/story-viewer';

function isVideoUrl(url?: string | null) {
 if (!url) return false;
 return /\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i.test(url);
}

export function StoryStrip() {
 const [viewerIndex, setViewerIndex] = useState<number | null>(null);

 const { data = [], isLoading } = useQuery({
 queryKey: ['stories'],
 queryFn: () => apiGet<Story[]>('/stories'),
 });

 return (
 <section className="relative z-10">
 <div className="mb-4 flex items-center justify-between gap-4">
 <div>
 <div className="mb-1 flex items-center gap-2 text-hell-light">
 <Sparkles size={18} />
 <span className="text-sm font-black">استوری‌ها</span>
 </div>
 <h2 className="text-2xl font-black">ادیت‌ها و لحظه‌های جامعه</h2>
 </div>
 </div>

 <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-3">
 <CreateStoryCard />

 {isLoading
 ? Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="h-36 min-w-28 rounded-[2rem] skeleton" />
 ))
 : data.map((story, index) => (
 <button
 type="button"
 key={story.id}
 onClick={() => setViewerIndex(index)}
 className="card group min-h-36 min-w-32 rounded-[2rem] p-2 text-right transition hover:-translate-y-1"
 >
 <div className="relative h-24 overflow-hidden rounded-[1.5rem] bg-black">
 {story.mediaUrl ? (
 isVideoUrl(story.mediaUrl) ? (
 <video
 src={story.mediaUrl}
 className="h-full w-full object-cover"
 muted
 loop
 playsInline
 onMouseEnter={(event) => event.currentTarget.play().catch(() => {})}
 onMouseLeave={(event) => {
 event.currentTarget.pause();
 event.currentTarget.currentTime = 0;
 }}
 />
 ) : (
 <img src={story.mediaUrl} alt={story.user.username} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
 )
 ) : (
 <div className="grid h-full place-items-center px-2 text-center text-xs leading-5 text-white/70">
 {story.text}
 </div>
 )}

 <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 ">
 <Camera size={13} />
 </div>
 </div>

 <p className="mt-3 truncate text-center text-xs font-bold text-white/60">
 {story.user.displayName || story.user.username}
 </p>
 </button>
 ))}
 </div>

 {viewerIndex !== null ? (
 <StoryViewer
 stories={data}
 initialIndex={viewerIndex}
 onClose={() => setViewerIndex(null)}
 />
 ) : null}
 </section>
 );
}
