import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactCommentDto, VoteCommentDto } from './dto/comment-action.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByChapter(chapterId: string) {
    return this.prisma.comment.findMany({
      where: {
        chapterId,
        parentId: null,
        isHidden: false,
      },
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
        replies: {
          where: { isHidden: false },
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
            reactions: true,
            votes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        userId,
        mangaId: dto.mangaId,
        chapterId: dto.chapterId,
        parentId: dto.parentId,
        body: dto.body,
        spoiler: dto.spoiler ?? false,
      },
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
    });
  }

  async vote(userId: string, commentId: string, dto: VoteCommentDto) {
    await this.ensureComment(commentId);

    return this.prisma.commentVote.upsert({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
      update: {
        value: dto.value,
      },
      create: {
        userId,
        commentId,
        value: dto.value,
      },
    });
  }

  async react(userId: string, commentId: string, dto: ReactCommentDto) {
    await this.ensureComment(commentId);

    return this.prisma.commentReaction.upsert({
      where: {
        userId_commentId_emoji: {
          userId,
          commentId,
          emoji: dto.emoji,
        },
      },
      update: {},
      create: {
        userId,
        commentId,
        emoji: dto.emoji,
      },
    });
  }

  async report(commentId: string) {
    await this.ensureComment(commentId);

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        reports: {
          increment: 1,
        },
      },
    });
  }

  async hide(commentId: string) {
    await this.ensureComment(commentId);

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isHidden: true,
      },
    });
  }

  private async ensureComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('کامنت پیدا نشد.');
    return comment;
  }
}
