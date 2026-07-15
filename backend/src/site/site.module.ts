import { Module } from '@nestjs/common';
import { PlaceholderController } from './placeholder.controller';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  controllers: [SiteController, PlaceholderController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
