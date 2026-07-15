import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollProjectDto } from './dto/create-poll-project.dto';

@Controller('polls')
export class PollsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  list() {
    return this.prisma.pollProject.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreatePollProjectDto) {
    return this.prisma.pollProject.create({
      data: dto,
    });
  }

  @Post(':id/vote')
  vote(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.prisma.vote.upsert({
      where: {
        userId_projectId: {
          userId: user.sub,
          projectId: id,
        },
      },
      update: {},
      create: {
        userId: user.sub,
        projectId: id,
      },
    });
  }
}
