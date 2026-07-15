import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeName(input: string) {
  return input.trim().replace(/\s+/g, ' ');
}

function uniqueCleanList(values?: string[]) {
  const seenBySlug = new Set<string>();
  const seenByName = new Set<string>();
  const result: string[] = [];

  for (const raw of values || []) {
    const name = normalizeName(raw);
    const slug = slugify(name);

    if (!name || !slug) continue;

    const nameKey = name.toLowerCase();

    if (seenBySlug.has(slug) || seenByName.has(nameKey)) {
      continue;
    }

    seenBySlug.add(slug);
    seenByName.add(nameKey);
    result.push(name);
  }

  return result;
}

@Injectable()
export class MangaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: PaginationDto & { q?: string; genre?: string }) {
    const cacheKey = `manga:list:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const where: Prisma.MangaWhereInput = {
      published: true,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { altTitle: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.genre
        ? {
            genres: {
              some: {
                slug: query.genre,
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.manga.findMany({
        where,
        skip: query.skip,
        take: query.take,
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
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.manga.count({ where }),
    ]);

    const result = {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };

    await this.redis.set(cacheKey, result, 30);
    return result;
  }

  async popular() {
    return this.prisma.manga.findMany({
      where: { published: true },
      include: {
        genres: true,
        chapters: {
          where: { published: true },
          orderBy: { number: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
          },
        },
      },
      orderBy: [
        {
          likes: {
            _count: 'desc',
          },
        },
        { updatedAt: 'desc' },
      ],
      take: 12,
    });
  }

  async detail(slug: string) {
    const manga = await this.prisma.manga.findUnique({
      where: { slug },
      include: {
        genres: true,
        tags: true,
        chapters: {
          where: { published: true },
          orderBy: { number: 'desc' },
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

    if (!manga || !manga.published) {
      throw new NotFoundException('مانهوا پیدا نشد.');
    }

    return manga;
  }

  async chapter(chapterId: string, userId?: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        manga: {
          select: {
            id: true,
            slug: true,
            title: true,
            cover: true,
          },
        },
      },
    });

    if (!chapter || !chapter.published) {
      throw new NotFoundException('چپتر پیدا نشد.');
    }

    await this.prisma.chapter.update({
      where: { id: chapter.id },
      data: { views: { increment: 1 } },
    });

    if (userId) {
      await this.prisma.readingHistory.upsert({
        where: {
          userId_mangaId: {
            userId,
            mangaId: chapter.mangaId,
          },
        },
        update: {
          chapterId: chapter.id,
          progress: 100,
        },
        create: {
          userId,
          mangaId: chapter.mangaId,
          chapterId: chapter.id,
          progress: 100,
        },
      });
    }

    return chapter;
  }

  async create(dto: CreateMangaDto) {
    const slug = slugify(dto.slug);

    if (!slug) {
      throw new BadRequestException('slug معتبر نیست.');
    }

    const exists = await this.prisma.manga.findUnique({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException('این slug قبلاً استفاده شده است.');
    }

    const genres = await this.ensureGenres(dto.genres);
    const tags = await this.ensureTags(dto.tags);

    const manga = await this.prisma.manga.create({
      data: {
        title: dto.title,
        altTitle: dto.altTitle,
        slug,
        description: dto.description,
        cover: dto.cover,
        banner: dto.banner,
        status: dto.status,
        published: dto.published ?? true,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        genres: {
          connect: genres.map((genre) => ({ id: genre.id })),
        },
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        genres: true,
        tags: true,
      },
    });

    await this.clearListCache();
    return manga;
  }

  async update(id: string, dto: UpdateMangaDto) {
    const genres = dto.genres ? await this.ensureGenres(dto.genres) : undefined;
    const tags = dto.tags ? await this.ensureTags(dto.tags) : undefined;

    const manga = await this.prisma.manga.update({
      where: { id },
      data: {
        title: dto.title,
        altTitle: dto.altTitle,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        description: dto.description,
        cover: dto.cover,
        banner: dto.banner,
        status: dto.status,
        published: dto.published,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        ...(genres
          ? {
              genres: {
                set: genres.map((genre) => ({ id: genre.id })),
              },
            }
          : {}),
        ...(tags
          ? {
              tags: {
                set: tags.map((tag) => ({ id: tag.id })),
              },
            }
          : {}),
      },
      include: {
        genres: true,
        tags: true,
      },
    });

    await this.clearListCache();
    return manga;
  }

  async remove(id: string) {
    await this.prisma.manga.delete({ where: { id } });
    await this.clearListCache();
    return { ok: true };
  }

  async addChapter(mangaId: string, dto: CreateChapterDto) {
    const chapter = await this.prisma.chapter.create({
      data: {
        mangaId,
        number: dto.number,
        title: dto.title,
        pages: dto.pages,
        pdfUrl: dto.pdfUrl,
        zipUrl: dto.zipUrl,
        summary: dto.summary,
        published: dto.published ?? true,
      },
    });

    await this.clearListCache();
    return chapter;
  }

  async removeChapter(chapterId: string) {
    await this.prisma.chapter.delete({
      where: { id: chapterId },
    });

    await this.clearListCache();

    return { ok: true };
  }

  async bookmark(mangaId: string, userId: string) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      update: {},
      create: {
        userId,
        mangaId,
      },
    });
  }

  async unbookmark(mangaId: string, userId: string) {
    await this.prisma.bookmark.deleteMany({
      where: {
        userId,
        mangaId,
      },
    });

    return { ok: true };
  }

  async likeManga(mangaId: string, userId: string) {
    return this.prisma.like.upsert({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      update: {},
      create: {
        userId,
        mangaId,
      },
    });
  }

  async unlikeManga(mangaId: string, userId: string) {
    await this.prisma.like.deleteMany({
      where: {
        userId,
        mangaId,
      },
    });

    return { ok: true };
  }

  async likeChapter(chapterId: string, userId: string) {
    return this.prisma.like.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {},
      create: {
        userId,
        chapterId,
      },
    });
  }

  async canManage(role: Role) {
    const allowedRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN, Role.TRANSLATOR];
    return allowedRoles.includes(role);
  }

  private async ensureGenres(values?: string[]) {
    const names = uniqueCleanList(values);
    const result: { id: string; name: string; slug: string }[] = [];

    for (const name of names) {
      const slug = slugify(name);

      let genre = await this.prisma.genre.findFirst({
        where: {
          OR: [{ slug }, { name }],
        },
      });

      if (!genre) {
        try {
          genre = await this.prisma.genre.create({
            data: { name, slug },
          });
        } catch (error) {
          if (this.isUniqueError(error)) {
            genre = await this.prisma.genre.findFirst({
              where: {
                OR: [{ slug }, { name }],
              },
            });
          }

          if (!genre) {
            throw error;
          }
        }
      }

      if (!result.some((item) => item.id === genre.id)) {
        result.push(genre);
      }
    }

    return result;
  }

  private async ensureTags(values?: string[]) {
    const names = uniqueCleanList(values);
    const result: { id: string; name: string; slug: string }[] = [];

    for (const name of names) {
      const slug = slugify(name);

      let tag = await this.prisma.tag.findFirst({
        where: {
          OR: [{ slug }, { name }],
        },
      });

      if (!tag) {
        try {
          tag = await this.prisma.tag.create({
            data: { name, slug },
          });
        } catch (error) {
          if (this.isUniqueError(error)) {
            tag = await this.prisma.tag.findFirst({
              where: {
                OR: [{ slug }, { name }],
              },
            });
          }

          if (!tag) {
            throw error;
          }
        }
      }

      if (!result.some((item) => item.id === tag.id)) {
        result.push(tag);
      }
    }

    return result;
  }

  private isUniqueError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private async clearListCache() {
    const keys = await this.redis.instance.keys('manga:list:*');
    if (keys.length) await this.redis.instance.del(...keys);
  }
}
