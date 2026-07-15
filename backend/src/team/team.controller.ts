import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { TeamService } from './team.service';
import {
  CreateTeamRequestDto,
  SubmitTeamProfileDto,
} from './dto/team-request.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get()
  info() {
    return this.teamService.info();
  }

  @Public()
  @Get('test-files')
  testFiles() {
    return this.teamService.getTestFiles();
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.teamService.getMe(user.sub);
  }

  @Post('request')
  createRequest(@CurrentUser() user: RequestUser, @Body() dto: CreateTeamRequestDto) {
    return this.teamService.createRequest(user.sub, dto);
  }

  @Patch('me/profile')
  submitProfile(@CurrentUser() user: RequestUser, @Body() dto: SubmitTeamProfileDto) {
    return this.teamService.submitProfile(user.sub, dto);
  }
}