import { Controller, Get, Patch, Param } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.prisma.notification.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Patch(':id/read')
  read(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId: user.sub,
      },
      data: {
        read: true,
      },
    });
  }
}
