import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redis.instance.ping();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
