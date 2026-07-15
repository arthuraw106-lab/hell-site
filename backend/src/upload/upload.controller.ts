import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 250 * 1024 * 1024,
      },
    }),
  )
  upload(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(user.sub, file);
  }

  @Post('chapter-zip')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 350 * 1024 * 1024,
      },
    }),
  )
  uploadChapterZip(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadChapterZip(user.sub, file);
  }
}
