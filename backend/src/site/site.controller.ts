import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Public()
  @Get('home-featured-manga')
  getHomeFeaturedManga() {
    return this.siteService.getHomeFeaturedManga();
  }
}
