import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CMSService } from './cms.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@ApiTags('CMS')
@Controller('cms')
export class CMSController {
  constructor(private cmsService: CMSService) {}

  @Get('banners')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get active banners' })
  getBanners() {
    return this.cmsService.getBanners();
  }

  @Get('banners/manage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all banners' })
  listBanners() {
    return this.cmsService.listBanners();
  }

  @Post('banners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner' })
  createBanner(@Body() data: CreateBannerDto) {
    return this.cmsService.createBanner(data);
  }

  @Put('banners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  updateBanner(@Param('id') id: string, @Body() data: UpdateBannerDto) {
    return this.cmsService.updateBanner(id, data);
  }

  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner' })
  deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(id);
  }

  @Get('sections')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get active homepage sections' })
  getSections() {
    return this.cmsService.getSections();
  }

  // Sections management (admin)
  @Get('sections/manage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all sections' })
  listSections() {
    return this.cmsService.listSections();
  }

  @Post('sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create section' })
  createSection(@Body() data: CreateSectionDto) {
    return this.cmsService.createSection(data);
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update section' })
  updateSection(@Param('id') id: string, @Body() data: UpdateSectionDto) {
    return this.cmsService.updateSection(id, data);
  }

  @Delete('sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete section' })
  deleteSection(@Param('id') id: string) {
    return this.cmsService.deleteSection(id);
  }

  @Post('sections/seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed default homepage sections (admin)' })
  seedSections() {
    return this.cmsService.seedSections();
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get CMS page by slug' })
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }
}
