import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        readingHistory: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: {
            manga: {
              select: {
                id: true,
                slug: true,
                title: true,
                cover: true,
              },
            },
            chapter: {
              select: {
                id: true,
                number: true,
                title: true,
              },
            },
          },
        },
        bookmarks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
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
        },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد.');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const exists = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          NOT: { id: userId },
        },
      });

      if (exists) {
        throw new BadRequestException('این نام کاربری قبلاً استفاده شده است.');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        phone: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async publicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد.');
    }

    return user;
  }
}
