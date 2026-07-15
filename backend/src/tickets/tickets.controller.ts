import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role, TicketStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, ReplyTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  mine(@CurrentUser() user: RequestUser) {
    return this.prisma.ticket.findMany({
      where: { userId: user.sub },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        userId: user.sub,
        category: dto.category,
        subject: dto.subject,
        messages: {
          create: {
            userId: user.sub,
            body: dto.body,
          },
        },
      },
      include: { messages: true },
    });
  }

  @Post(':id/reply')
  reply(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: ReplyTicketDto) {
    const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
    const isAdmin = adminRoles.includes(user.role);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: isAdmin ? TicketStatus.ANSWERED : TicketStatus.OPEN,
        messages: {
          create: {
            userId: user.sub,
            body: dto.body,
            isAdmin,
          },
        },
      },
      include: { messages: true },
    });
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.CLOSED },
    });
  }

  @Get('admin/all')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  all() {
    return this.prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }
}
