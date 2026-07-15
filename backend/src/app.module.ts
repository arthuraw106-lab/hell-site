import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { SiteModule } from './site/site.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommentsModule } from './comments/comments.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health.controller';
import { MangaModule } from './manga/manga.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PollsModule } from './polls/polls.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { StoriesModule } from './stories/stories.module';
import { TeamModule } from './team/team.module';
import { TicketsModule } from './tickets/tickets.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    SiteModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    JwtModule.register({
      global: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AiModule,
    RedisModule,
    AuthModule,
    UsersModule,
    MangaModule,
    CommentsModule,
    UploadModule,
    StoriesModule,
    TeamModule,
    PollsModule,
    TicketsModule,
    AdminModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
