import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { TeamService } from '../team/team.service';
import {
  CreateTeamTestFileDto,
  TeamReviewDto,
  UpdateTeamTestFileDto,
} from './dto/team-admin.dto';

@Controller('admin/team')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class TeamAdminController {
  constructor(private readonly teamService: TeamService) {}

  @Get('requests')
  requests() {
    return this.teamService.adminListRequests();
  }

  @Patch('requests/:id/approve-test')
  approveTest(@Param('id') id: string, @CurrentUser() admin: RequestUser, @Body() dto: TeamReviewDto) {
    return this.teamService.adminApproveTest(id, admin.sub, dto.note);
  }

  @Patch('requests/:id/reject-test')
  rejectTest(@Param('id') id: string, @CurrentUser() admin: RequestUser, @Body() dto: TeamReviewDto) {
    return this.teamService.adminRejectTest(id, admin.sub, dto.note);
  }

  @Patch('requests/:id/approve-final')
  approveFinal(@Param('id') id: string, @CurrentUser() admin: RequestUser, @Body() dto: TeamReviewDto) {
    return this.teamService.adminApproveFinal(id, admin.sub, dto.note);
  }

  @Patch('requests/:id/reject-final')
  rejectFinal(@Param('id') id: string, @CurrentUser() admin: RequestUser, @Body() dto: TeamReviewDto) {
    return this.teamService.adminRejectFinal(id, admin.sub, dto.note);
  }

  @Get('test-files')
  testFiles() {
    return this.teamService.getTestFiles();
  }

  @Post('test-files')
  createTestFile(@Body() dto: CreateTeamTestFileDto) {
    return this.teamService.adminCreateTestFile(dto);
  }

  @Patch('test-files/:id')
  updateTestFile(@Param('id') id: string, @Body() dto: UpdateTeamTestFileDto) {
    return this.teamService.adminUpdateTestFile(id, dto);
  }

  @Delete('test-files/:id')
  deleteTestFile(@Param('id') id: string) {
    return this.teamService.adminDeleteTestFile(id);
  }
}