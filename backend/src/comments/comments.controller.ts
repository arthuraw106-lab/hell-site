import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { ReactCommentDto, VoteCommentDto } from './dto/comment-action.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('chapter/:chapterId')
  listByChapter(@Param('chapterId') chapterId: string) {
    return this.commentsService.listByChapter(chapterId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user.sub, dto);
  }

  @Post(':id/vote')
  vote(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: VoteCommentDto) {
    return this.commentsService.vote(user.sub, id, dto);
  }

  @Post(':id/react')
  react(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: ReactCommentDto) {
    return this.commentsService.react(user.sub, id, dto);
  }

  @Post(':id/report')
  report(@Param('id') id: string) {
    return this.commentsService.report(id);
  }

  @Patch(':id/hide')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  hide(@Param('id') id: string) {
    return this.commentsService.hide(id);
  }
}
