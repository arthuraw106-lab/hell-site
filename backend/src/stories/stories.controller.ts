import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Public()
  @Get()
  list() {
    return this.storiesService.list();
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(user.sub, dto);
  }

  @Post(':id/view')
  view(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.storiesService.markView(user.sub, id);
  }

  @Get(':id/insights')
  insights(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.storiesService.insights(user.sub, user.role, id);
  }

  @Post(':id/like')
  like(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.storiesService.like(user.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
    const isAdmin = adminRoles.includes(user.role);
    return this.storiesService.remove(user.sub, id, isAdmin);
  }
}
