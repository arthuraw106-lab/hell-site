import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequestUser } from '../common/types/request-user.type';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateMangaDto } from './dto/create-manga.dto';
import { UpdateMangaDto } from './dto/update-manga.dto';
import { MangaService } from './manga.service';

@Controller('manga')
export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  @Public()
  @Get()
  list(@Query() query: PaginationDto & { q?: string; genre?: string }) {
    return this.mangaService.list(query);
  }

  @Public()
  @Get('popular')
  popular() {
    return this.mangaService.popular();
  }

  @Public()
  @Get('chapters/:chapterId/read')
  readChapter(@Param('chapterId') chapterId: string, @Req() request: any) {
    return this.mangaService.chapter(chapterId, request.user?.sub);
  }

  @Public()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.mangaService.detail(slug);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateMangaDto) {
    return this.mangaService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMangaDto) {
    return this.mangaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.mangaService.remove(id);
  }

  @Post(':id/chapters')
  @Roles(Role.TRANSLATOR, Role.ADMIN, Role.SUPER_ADMIN)
  addChapter(@Param('id') id: string, @Body() dto: CreateChapterDto) {
    return this.mangaService.addChapter(id, dto);
  }

  @Post(':id/bookmark')
  bookmark(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.mangaService.bookmark(id, user.sub);
  }

  @Delete(':id/bookmark')
  unbookmark(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.mangaService.unbookmark(id, user.sub);
  }

  @Post(':id/like')
  likeManga(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.mangaService.likeManga(id, user.sub);
  }

  @Delete(':id/like')
  unlikeManga(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.mangaService.unlikeManga(id, user.sub);
  }

  @Delete('chapters/:chapterId')
  @Roles(Role.TRANSLATOR, Role.ADMIN, Role.SUPER_ADMIN)
  removeChapter(@Param('chapterId') chapterId: string) {
    return this.mangaService.removeChapter(chapterId);
  }

  @Post('chapters/:chapterId/like')
  likeChapter(@Param('chapterId') chapterId: string, @CurrentUser() user: RequestUser) {
    return this.mangaService.likeChapter(chapterId, user.sub);
  }
}
