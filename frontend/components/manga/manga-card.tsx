import { BookOpen, Bookmark, Heart, Layers, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Manga } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';

export function MangaCard({ manga, index = 0 }: { manga: Manga; index?: number }) {
 const latestChapter = manga.chapters?.[0];
 const delay = `${0.3 + index * 0.025}s`;

 return (
 <div
 className="animate-reveal"
 style={{ animationDelay: delay }}
 >
 <Link href={`/manga/${manga.slug}`} className="group block h-full">
 <article className="card relative h-full rounded-[2rem] transition duration-500 hover:-translate-y-2 hover:">
 <div className="relative aspect-[3/4] overflow-hidden rounded-t-[2rem] bg-black">
 <img
 src={manga.cover || getImageFallback(manga.title)}
 alt={manga.title}
 loading="lazy"
 className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
 />

 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-90" />

 <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-1.5 text-xs font-black text-white/80">
 <Sparkles size={13} className="text-hell-light" />
 {manga.status}
 </div>

 <div className="absolute bottom-3 right-3 left-3">
 <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/75 p-3">
 <span className="flex items-center gap-1 text-xs font-bold text-white/70">
 <BookOpen size={14} className="text-hell-light" />
 {latestChapter ? `چپتر ${latestChapter.number}` : 'به‌زودی'}
 </span>
 <span className="flex items-center gap-1 text-xs font-bold text-white/50">
 <Layers size={14} />
 {manga.chapters?.length || 0}
 </span>
 </div>
 </div>
 </div>

 <div className="p-5">
 <h3 className="truncate text-xl font-black transition group-hover:text-hell-light">
 {manga.title}
 </h3>

 {manga.altTitle ? (
 <p className="mt-1 truncate text-xs text-white/35">{manga.altTitle}</p>
 ) : null}

 <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/52">
 {manga.description}
 </p>

 <div className="mt-4 flex flex-wrap gap-2">
 {manga.genres?.slice(0, 3).map((genre) => (
 <Badge key={genre.id} className="bg-hell-violet/15 text-violet-100">
 {genre.name}
 </Badge>
 ))}
 </div>

 <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/42">
 <span className="flex items-center gap-1">
 <Heart size={14} className="text-hell-violet" />
 {manga._count?.likes || 0}
 </span>
 <span className="flex items-center gap-1">
 <Bookmark size={14} className="text-hell-light" />
 {manga._count?.bookmarks || 0}
 </span>
 </div>
 </div>
 </article>
 </Link>
 </div>
 );
}