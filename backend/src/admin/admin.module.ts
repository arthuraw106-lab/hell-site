import { Module } from '@nestjs/common';
import { TeamAdminController } from './team-admin.controller';
import { TeamModule } from '../team/team.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TeamModule],
  controllers: [AdminController, TeamAdminController],
})
export class AdminModule {}
