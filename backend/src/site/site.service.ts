import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeFeaturedManga() {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'home-featured-manga' },
    });

    const value = setting?.value as { mangaId?: string } | null;
    const mangaId = value?.mangaId;

    if (!mangaId) {
      return null;
    }

    return this.prisma.manga.findUnique({
      where: { id: mangaId },
      include: {
        genres: true,
        tags: true,
        chapters: {
          where: { published: true },
          orderBy: { number: 'desc' },
          take: 3,
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
          },
        },
      },
    });
  }
}
