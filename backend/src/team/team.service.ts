import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Role,
  TeamJoinStatus,
  TeamRequestStatus,
  TeamRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeamRequestDto,
  SubmitTeamProfileDto,
} from './dto/team-request.dto';
import {
  CreateTeamTestFileDto,
  UpdateTeamTestFileDto,
} from '../admin/dto/team-admin.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  info() {
    return {
      title: 'عضویت در تیم ترجمه هل مانهوا',
      steps: [
        'انتخاب نقش و دانلود فایل تست',
        'آپلود تست انجام‌شده و ثبت درخواست',
        'بررسی مرحله اول توسط ادمین',
        'ثبت اطلاعات تکمیلی بعد از تایید تست',
        'تایید نهایی و فعال شدن پنل تیم و گپ تیم',
      ],
      roles: [
        { value: TeamRole.TRANSLATOR, label: 'مترجم' },
        { value: TeamRole.CLEANER, label: 'کلینر' },
        { value: TeamRole.TYPESETTER, label: 'تایپیست' },
        { value: TeamRole.EDITOR, label: 'ادیتور' },
        { value: TeamRole.UPLOADER, label: 'آپلودر' },
      ],
    };
  }

  async getTestFiles() {
    return this.prisma.teamTestFile.findMany({
      orderBy: { role: 'asc' },
    });
  }

  async getMe(userId: string) {
    const profile = await this.prisma.teamMemberProfile.findUnique({
      where: { userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    const requests = await this.prisma.teamRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { profile, requests };
  }

  async createRequest(userId: string, dto: CreateTeamRequestDto) {
    const existingProfile = await this.prisma.teamMemberProfile.findUnique({
      where: { userId },
    });

    if (
      existingProfile &&
      (existingProfile.status !== TeamJoinStatus.TEST_REJECTED &&
       existingProfile.status !== TeamJoinStatus.REJECTED)
    ) {
      throw new BadRequestException(
        'شما از قبل یک درخواست فعال یا عضویت فعال در تیم دارید.',
      );
    }

    const request = await this.prisma.teamRequest.create({
      data: {
        userId,
        requestedRole: dto.requestedRole,
        experience: dto.experience || '',
        skills: dto.skills || '',
        sampleUrl: dto.sampleUrl,
        testFileUrl: dto.testFileUrl,
        status: TeamRequestStatus.PENDING,
      },
    });

    const profile = await this.prisma.teamMemberProfile.upsert({
      where: { userId },
      create: {
        userId,
        teamRole: dto.requestedRole,
        status: TeamJoinStatus.TEST_PENDING,
      },
      update: {
        teamRole: dto.requestedRole,
        status: TeamJoinStatus.TEST_PENDING,
        approvedTestAt: null,
        fullyApprovedAt: null,
      },
    });

    await this.createOrAppendTeamTicket(
      userId,
      `درخواست عضویت تیم ثبت شد. نقش درخواستی: ${dto.requestedRole}`,
      false,
    );

    return { request, profile };
  }

  async submitProfile(userId: string, dto: SubmitTeamProfileDto) {
    const profile = await this.prisma.teamMemberProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل تیم برای شما پیدا نشد.');
    }

    if (profile.status !== TeamJoinStatus.TEST_APPROVED) {
      throw new BadRequestException(
        'فعلاً امکان ثبت اطلاعات تکمیلی وجود ندارد. اول باید تست شما تایید شود.',
      );
    }

    const updatedProfile = await this.prisma.teamMemberProfile.update({
      where: { userId },
      data: {
        phone: dto.phone,
        telegramId: dto.telegramId,
        cardNumber: dto.cardNumber,
        status: TeamJoinStatus.PROFILE_PENDING,
      },
    });

    const latestRequest = await this.prisma.teamRequest.findFirst({
      where: { userId, status: TeamRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    if (latestRequest) {
      await this.prisma.teamRequest.update({
        where: { id: latestRequest.id },
        data: { profileSubmittedAt: new Date() },
      });
    }

    await this.createOrAppendTeamTicket(
      userId,
      'اطلاعات تکمیلی تیم ارسال شد و منتظر تایید نهایی ادمین است.',
      false,
    );

    return updatedProfile;
  }

  async adminListRequests() {
    return this.prisma.teamRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            teamProfile: true,
          },
        },
      },
    });
  }

  async adminCreateTestFile(dto: CreateTeamTestFileDto) {
    return this.prisma.teamTestFile.upsert({
      where: { role: dto.role },
      create: {
        role: dto.role,
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
      },
      update: {
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async adminUpdateTestFile(id: string, dto: UpdateTeamTestFileDto) {
    const exists = await this.prisma.teamTestFile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('فایل تست پیدا نشد.');

    return this.prisma.teamTestFile.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async adminDeleteTestFile(id: string) {
    const exists = await this.prisma.teamTestFile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('فایل تست پیدا نشد.');

    await this.prisma.teamTestFile.delete({ where: { id } });
    return { ok: true };
  }

  async adminApproveTest(requestId: string, adminId: string, note?: string) {
    const request = await this.getTeamRequestOrThrow(requestId);

    const profile = await this.prisma.teamMemberProfile.upsert({
      where: { userId: request.userId },
      create: {
        userId: request.userId,
        teamRole: request.requestedRole as TeamRole,
        status: TeamJoinStatus.TEST_APPROVED,
        approvedTestAt: new Date(),
      },
      update: {
        teamRole: request.requestedRole as TeamRole,
        status: TeamJoinStatus.TEST_APPROVED,
        approvedTestAt: new Date(),
      },
    });

    const updatedRequest = await this.prisma.teamRequest.update({
      where: { id: requestId },
      data: {
        testReviewedAt: new Date(),
        adminNote: note,
      },
    });

    await this.createOrAppendTeamTicket(
      request.userId,
      note || 'تست شما تایید شد. لطفاً اطلاعات تکمیلی تیم را وارد کنید.',
      true,
      adminId,
    );

    return { request: updatedRequest, profile };
  }

  async adminRejectTest(requestId: string, adminId: string, note?: string) {
    const request = await this.getTeamRequestOrThrow(requestId);

    const profile = await this.prisma.teamMemberProfile.update({
      where: { userId: request.userId },
      data: {
        status: TeamJoinStatus.TEST_REJECTED,
      },
    });

    const updatedRequest = await this.prisma.teamRequest.update({
      where: { id: requestId },
      data: {
        status: TeamRequestStatus.REJECTED,
        testReviewedAt: new Date(),
        adminNote: note,
      },
    });

    await this.createOrAppendTeamTicket(
      request.userId,
      note || 'متاسفانه تست شما تایید نشد.',
      true,
      adminId,
    );

    return { request: updatedRequest, profile };
  }

  async adminApproveFinal(requestId: string, adminId: string, note?: string) {
    const request = await this.getTeamRequestOrThrow(requestId);

    const profile = await this.prisma.teamMemberProfile.findUnique({
      where: { userId: request.userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل تیم کاربر پیدا نشد.');
    }

    if (profile.status !== TeamJoinStatus.PROFILE_PENDING) {
      throw new BadRequestException(
        'کاربر هنوز اطلاعات تکمیلی را ارسال نکرده یا وضعیتش مناسب تایید نهایی نیست.',
      );
    }

    const updatedProfile = await this.prisma.teamMemberProfile.update({
      where: { userId: request.userId },
      data: {
        status: TeamJoinStatus.FULL_APPROVED,
        fullyApprovedAt: new Date(),
      },
    });

    const updatedRequest = await this.prisma.teamRequest.update({
      where: { id: requestId },
      data: {
        status: TeamRequestStatus.APPROVED,
        finalReviewedAt: new Date(),
        adminNote: note,
      },
    });

    await this.prisma.user.update({
      where: { id: request.userId },
      data: { role: Role.TRANSLATOR },
    });

    await this.ensureTranslationTeamRoom(request.userId);

    await this.createOrAppendTeamTicket(
      request.userId,
      note ||
        'عضویت شما به صورت نهایی تایید شد. پنل تیم و گپ تیم برای شما فعال شد.',
      true,
      adminId,
    );

    return { request: updatedRequest, profile: updatedProfile };
  }

  async adminRejectFinal(requestId: string, adminId: string, note?: string) {
    const request = await this.getTeamRequestOrThrow(requestId);

    const profile = await this.prisma.teamMemberProfile.update({
      where: { userId: request.userId },
      data: {
        status: TeamJoinStatus.REJECTED,
      },
    });

    const updatedRequest = await this.prisma.teamRequest.update({
      where: { id: requestId },
      data: {
        status: TeamRequestStatus.REJECTED,
        finalReviewedAt: new Date(),
        adminNote: note,
      },
    });

    await this.createOrAppendTeamTicket(
      request.userId,
      note || 'درخواست عضویت شما در مرحله نهایی رد شد.',
      true,
      adminId,
    );

    return { request: updatedRequest, profile };
  }

  private async getTeamRequestOrThrow(id: string) {
    const request = await this.prisma.teamRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('درخواست تیم پیدا نشد.');
    }

    return request;
  }

  private async createOrAppendTeamTicket(
    userId: string,
    message: string,
    isAdmin: boolean,
    adminId?: string,
  ) {
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        userId,
        category: 'TEAM_REQUEST',
        status: { not: 'CLOSED' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingTicket) {
      await this.prisma.ticketMessage.create({
        data: {
          ticketId: existingTicket.id,
          userId: isAdmin ? (adminId || userId) : userId,
          body: message,
          isAdmin,
        },
      });
      return existingTicket;
    }

    return this.prisma.ticket.create({
      data: {
        userId,
        category: 'TEAM_REQUEST',
        subject: 'درخواست عضویت تیم ترجمه',
        messages: {
          create: {
            userId,
            body: message,
            isAdmin,
          },
        },
      },
    });
  }

  private async ensureTranslationTeamRoom(userId: string) {
    const room = await this.prisma.chatRoom.upsert({
      where: { slug: 'translation_team_room' },
      create: {
        slug: 'translation_team_room',
        name: 'گروه ترجمه هل مانهوا',
        description: 'گپ مخصوص اعضای تاییدشده تیم ترجمه',
        isPrivate: true,
      },
      update: {
        name: 'گروه ترجمه هل مانهوا',
        isPrivate: true,
      },
    });

    await this.prisma.chatMember.upsert({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId,
        },
      },
      create: {
        roomId: room.id,
        userId,
      },
      update: {},
    });

    return room;
  }
}
