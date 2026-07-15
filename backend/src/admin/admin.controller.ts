import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Role, TicketStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequestUser } from '../common/types/request-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { TeamService } from '../team/team.service';
import { UpdateTicketAdminDto, UpdateUserAdminDto } from './dto/admin-update.dto';
import { CreatePollProjectDto, UpdatePollProjectDto } from './dto/poll-project.dto';

@Controller('admin')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [users, mangas, chapters, comments, stories, tickets, teamRequests] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.manga.count(),
      this.prisma.chapter.count(),
      this.prisma.comment.count(),
      this.prisma.story.count(),
      this.prisma.ticket.count(),
      this.prisma.teamRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      users,
      mangas,
      chapters,
      comments,
      stories,
      tickets,
      pendingTeamRequests: teamRequests,
    };
  }

  @Get('users')
  users(@Query() query: PaginationDto & { q?: string }) {
    return this.prisma.user.findMany({
      where: query.q
        ? {
            OR: [
              { username: { contains: query.q, mode: 'insensitive' } },
              { phone: { contains: query.q } },
              { email: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {},
      skip: query.skip,
      take: query.take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true,
      },
    });
  }

  @Get('comments')
  comments() {
    return this.prisma.comment.findMany({
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        manga: {
          select: {
            title: true,
            slug: true,
          },
        },
        chapter: {
          select: {
            number: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  @Patch('comments/:id/hide')
  hideComment(@Param('id') id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { isHidden: true },
    });
  }

  @Get('team-requests')
  teamRequests() {
    return this.teamService.adminListRequests();
  }

  @Patch('team-requests/:id/approve')
  approveTeamRequest(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() body: { note?: string },
  ) {
    return this.teamService.adminApproveTest(id, admin.sub, body.note);
  }

  @Patch('team-requests/:id/reject')
  rejectTeamRequest(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() body: { note?: string },
  ) {
    return this.teamService.adminRejectTest(id, admin.sub, body.note);
  }

  @Patch('team-requests/:id')
  async updateTeamRequest(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; note?: string },
  ) {
    if (body.status === 'APPROVED') {
      return this.teamService.adminApproveFinal(id, admin.sub, body.note);
    }

    if (body.status === 'REJECTED') {
      return this.teamService.adminRejectFinal(id, admin.sub, body.note);
    }

    return this.prisma.teamRequest.update({
      where: { id },
      data: {
        status: body.status as any,
        note: body.note,
      },
    });
  }

  @Get('tickets')
  tickets() {
    return this.prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 300,
    });
  }

  @Patch('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketAdminDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  @Patch('tickets/:id/reply')
  replyTicket(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() body: { body: string; status?: TicketStatus },
  ) {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: body.status || TicketStatus.ANSWERED,
        messages: {
          create: {
            userId: admin.sub,
            body: body.body,
            isAdmin: true,
          },
        },
      },
      include: {
        messages: true,
      },
    });
  }
  @Get('home-featured-manga')
  async homeFeaturedManga() {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'home-featured-manga' },
    });

    return setting?.value || { mangaId: null };
  }

  @Patch('home-featured-manga')
  async updateHomeFeaturedManga(@Body() body: { mangaId: string }) {
    const manga = await this.prisma.manga.findUnique({
      where: { id: body.mangaId },
      select: { id: true, title: true, slug: true },
    });

    if (!manga) {
      return { ok: false, message: 'مانهوا پیدا نشد.' };
    }

    await this.prisma.siteSetting.upsert({
      where: { key: 'home-featured-manga' },
      update: {
        value: {
          mangaId: manga.id,
          title: manga.title,
          slug: manga.slug,
        },
      },
      create: {
        key: 'home-featured-manga',
        value: {
          mangaId: manga.id,
          title: manga.title,
          slug: manga.slug,
        },
      },
    });

    return {
      ok: true,
      manga,
    };
  }


  @Get('poll-projects')
  pollProjects() {
    return this.prisma.pollProject.findMany({
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Post('poll-projects')
    createPollProject(@Body() body: { title: string; description?: string; cover?: string }) {
      return this.prisma.pollProject.create({
        data: {
          title: body.title,
          description: body.description,
          cover: body.cover,
        },
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });
  }

  @Patch('poll-projects/:id')
  updatePollProject(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; cover?: string },
  ) {
    return this.prisma.pollProject.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        cover: body.cover,
      },
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });
  }

  @Patch('poll-projects/:id/close')
  closePollProject(@Param('id') id: string) {
    return this.prisma.pollProject.update({
      where: { id },
      data: {
        active: false,
      },
    });
  }

  @Delete('poll-projects/:id')
  deletePollProject(@Param('id') id: string) {
    return this.prisma.pollProject.delete({
      where: { id },
    });
  }


}
