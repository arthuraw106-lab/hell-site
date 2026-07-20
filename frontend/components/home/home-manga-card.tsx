import { BookOpen, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Manga } from '@/lib/types';
import { getImageFallback } from '@/lib/utils';

export function HomeMangaCard({ manga, index = 0 }: { manga: Manga; index?: number }) {
  const delay = `${0.3 + index * 0.035}s`;

  return (
    <div
      className="animate-card-reveal"
      style={{ animationDelay: delay }}
    >
      <Link href={`/manga/${manga.slug}`} className="group block">
        <article className="neo-card h-full rounded-[2rem] transition duration-500 hover:-translate-y-2 hover:shadow-glow">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-[2rem] bg-black">
            <img
              src={manga.cover || getImageFallback(manga.title)}
              alt={manga.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

            <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/75 px-3 py-1 text-xs font-black text-white/80">
              {manga.status}
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-2 text-xs font-black">
              <BookOpen size={14} className="text-hell-gold" />
              {manga.chapters?.[0]?.number ? `چپتر ${manga.chapters[0].number}` : 'به‌زودی'}
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-xl font-black transition group-hover:text-hell-gold">{manga.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/52">{manga.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {manga.genres?.slice(0, 2).map((genre) => (
                <Badge key={genre.id} className="bg-hell-violet/15 text-violet-100">{genre.name}</Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/42">
              <span className="flex items-center gap-1">
                <Heart size={13} className="text-hell-red" />
                {manga._count?.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Star size={13} className="text-hell-gold" />
                {manga._count?.bookmarks || 0}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}