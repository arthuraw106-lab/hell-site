import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.findMe(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Public()
  @Get(':username')
  publicProfile(@Param('username') username: string) {
    return this.usersService.publicProfile(username);
  }
}
