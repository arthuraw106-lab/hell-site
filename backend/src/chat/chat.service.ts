import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRoomType, MessageType, Role } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, SendMessageDto, UpdateRoomDto } from './dto/chat.dto';

const GLOBAL_ROOM_ID = 'global_room';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async myRooms(userId: string) {
    await this.ensureDefaultRoomsForUser(userId);

    return this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                bio: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createRoom(ownerId: string, dto: CreateRoomDto, creatorRole: Role) {
    const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

    if (!adminRoles.includes(creatorRole)) {
      throw new ForbiddenException('فقط ادمین‌ها می‌توانند گپ جدید بسازند.');
    }

    const memberIds = Array.from(new Set([ownerId, ...dto.memberIds]));

    if (dto.type === ChatRoomType.PRIVATE && memberIds.length !== 2) {
      throw new BadRequestException('چت خصوصی باید دقیقاً دو عضو داشته باشد.');
    }

    return this.prisma.chatRoom.create({
      data: {
        type: dto.type,
        name: dto.name,
        avatar: dto.avatar,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: {
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
        },
      },
    });
  }

  async updateRoom(roomId: string, dto: UpdateRoomDto, userId: string, role: Role) {
    const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

    if (!adminRoles.includes(role)) {
      throw new ForbiddenException('فقط ادمین‌ها می‌توانند گپ را ویرایش کنند.');
    }

    await this.ensureMember(roomId, userId);

    return this.prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
      },
    });
  }

  async messages(roomId: string, userId: string) {
    if (roomId === GLOBAL_ROOM_ID) {
      await this.ensureDefaultRoomsForUser(userId);
    }

    await this.ensureMember(roomId, userId);

    return this.prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 300,
    });
  }

  async userProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            bookmarks: true,
            stories: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد.');
    }

    return user;
  }

  async send(userId: string, dto: SendMessageDto) {
    if (dto.roomId === GLOBAL_ROOM_ID) {
      await this.ensureDefaultRoomsForUser(userId);
    }

    await this.ensureMember(dto.roomId, userId);

    const type = dto.type || (dto.mediaUrl ? this.detectMessageType(dto.mediaUrl) : MessageType.TEXT);

    if (!dto.body && !dto.mediaUrl) {
      throw new BadRequestException('پیام باید متن یا فایل داشته باشد.');
    }

    const message = await this.prisma.message.create({
      data: {
        userId,
        roomId: dto.roomId,
        type,
        body: dto.body,
        mediaUrl: dto.mediaUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: dto.roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async shouldAiReply(body?: string | null) {
    if (!body) return false;

    const text = body.toLowerCase();

    return (
      text.includes('@ai') ||
      text.includes('رجیس') ||
      text.includes('regis') ||
      text.includes('ربات')
    );
  }

  async aiReply(roomId: string, userMessage?: string | null) {
    const botName = process.env.AI_BOT_NAME || 'RegisBot';

    const bot = await this.prisma.user.upsert({
      where: { username: botName },
      update: {},
      create: {
        username: botName,
        displayName: 'رجیس بات',
        role: Role.USER,
        bio: 'بات خودمونی هل مانهوا برای گپ درباره مانهواها',
      },
    });

    await this.prisma.chatMember.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId: bot.id,
        },
      },
      update: {},
      create: {
        roomId,
        userId: bot.id,
      },
    });

    const reply = await this.aiService.askRegisBot(userMessage || 'یه پیشنهاد مانهوا بده.');

    const message = await this.prisma.message.create({
      data: {
        roomId,
        userId: bot.id,
        type: MessageType.TEXT,
        body: reply,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  private async ensureDefaultRoomsForUser(userId: string) {
    const globalRoom = await this.prisma.chatRoom.upsert({
      where: { id: GLOBAL_ROOM_ID },
      update: {
        type: ChatRoomType.GROUP,
        name: 'چت عمومی هل مانهوا',
      },
      create: {
        id: GLOBAL_ROOM_ID,
        type: ChatRoomType.GROUP,
        name: 'چت عمومی هل مانهوا',
      },
    });

    await this.prisma.chatMember.upsert({
      where: {
        roomId_userId: {
          roomId: globalRoom.id,
          userId,
        },
      },
      update: {},
      create: {
        roomId: globalRoom.id,
        userId,
      },
    });
  }

  private detectMessageType(url: string): MessageType {
    const lower = url.toLowerCase();

    if (lower.match(/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/)) return MessageType.IMAGE;
    if (lower.match(/\.(mp3|wav|ogg|m4a|aac|webm)(\?.*)?$/)) return MessageType.AUDIO;
    if (lower.match(/\.(mp4|mov|mkv|avi)(\?.*)?$/)) return MessageType.VIDEO;

    return MessageType.FILE;
  }

  private async ensureMember(roomId: string, userId: string) {
    const member = await this.prisma.chatMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('اتاق چت پیدا نشد یا عضو آن نیستید.');
    }

    return member;
  }
}
