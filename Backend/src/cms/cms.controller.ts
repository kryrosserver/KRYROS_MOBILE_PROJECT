import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CMSService } from './cms.service';

@ApiTags('CMS')
@Controller('cms')
export class CMSController {
  constructor(private cmsService: CMSService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Get active banners' })
  getBanners() {
    return this.cmsService.getBanners();
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get active homepage sections' })
  getSections() {
    return this.cmsService.getSections();
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get CMS page by slug' })
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }
}
