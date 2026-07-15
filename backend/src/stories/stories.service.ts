import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
        views: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateStoryDto) {
    if (!dto.text && !dto.mediaUrl) {
      throw new BadRequestException('استوری باید متن یا ویدیو/رسانه داشته باشد.');
    }

    return this.prisma.story.create({
      data: {
        userId,
        text: dto.text,
        mediaUrl: dto.mediaUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: true,
        views: true,
      },
    });
  }

  async markView(userId: string, storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story || story.expiresAt < new Date()) {
      throw new NotFoundException('استوری پیدا نشد یا منقضی شده است.');
    }

    if (story.userId === userId) {
      return { ok: true, ownerView: true };
    }

    await this.prisma.storyView.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {},
      create: {
        userId,
        storyId,
      },
    });

    return { ok: true };
  }

  async insights(userId: string, role: Role, storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        views: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!story) {
      throw new NotFoundException('استوری پیدا نشد.');
    }

    const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
    const canViewInsights = story.userId === userId || adminRoles.includes(role);

    if (!canViewInsights) {
      throw new ForbiddenException('فقط صاحب استوری می‌تواند بازدیدکننده‌ها و لایک‌ها را ببیند.');
    }

    return {
      story: {
        id: story.id,
        text: story.text,
        mediaUrl: story.mediaUrl,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        user: story.user,
      },
      viewers: story.views.map((view) => ({
        id: view.id,
        createdAt: view.createdAt,
        user: view.user,
      })),
      likers: story.likes.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
      })),
      counts: {
        views: story.views.length,
        likes: story.likes.length,
      },
    };
  }

  async like(userId: string, storyId: string) {
    return this.prisma.storyLike.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {},
      create: {
        userId,
        storyId,
      },
    });
  }

  async remove(userId: string, storyId: string, isAdmin = false) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return { ok: true };
    }

    if (!isAdmin && story.userId !== userId) {
      throw new ForbiddenException('اجازه حذف این استوری را ندارید.');
    }

    await this.prisma.story.delete({
      where: { id: storyId },
    });

    return { ok: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories() {
    await this.prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
