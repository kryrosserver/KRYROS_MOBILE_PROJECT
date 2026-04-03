import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CMSService } from './cms.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateFooterSectionDto } from './dto/create-footer-section.dto';
import { UpdateFooterSectionDto } from './dto/update-footer-section.dto';
import { CreateFooterLinkDto } from './dto/create-footer-link.dto';
import { UpdateFooterLinkDto } from './dto/update-footer-link.dto';
import { UpdateFooterConfigDto } from './dto/update-footer-config.dto';
import { CreateHomePageSectionDto } from './dto/create-homepage-section.dto';
import { UpdateHomePageSectionDto } from './dto/update-homepage-section.dto';

@ApiTags('CMS')
@Controller('cms')
export class CMSController {
  constructor(private cmsService: CMSService) {}

  // ==================== HOME PAGE SECTIONS ====================

  @Get('homepage-sections')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get active homepage sections' })
  getHomePageSections() {
    return this.cmsService.getHomePageSections();
  }

  @Get('homepage-sections/manage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all homepage sections (admin)' })
  listHomePageSections() {
    return this.cmsService.listHomePageSections();
  }

  @Post('homepage-sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create homepage section' })
  createHomePageSection(@Body() data: CreateHomePageSectionDto) {
    return this.cmsService.createHomePageSection(data);
  }

  @Put('homepage-sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update homepage section' })
  updateHomePageSection(@Param('id') id: string, @Body() data: UpdateHomePageSectionDto) {
    return this.cmsService.updateHomePageSection(id, data);
  }

  @Delete('homepage-sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete homepage section' })
  deleteHomePageSection(@Param('id') id: string) {
    return this.cmsService.deleteHomePageSection(id);
  }

  @Post('homepage-sections/seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed default homepage sections (admin)' })
  seedHomePageSections() {
    return this.cmsService.seedHomePageSections();
  }

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

  // ==================== FOOTER MANAGEMENT ====================

  @Get('footer')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get footer data' })
  getFooter() {
    return this.cmsService.getFooter();
  }

  // Footer Sections
  @Get('footer/sections/manage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all footer sections' })
  listFooterSections() {
    return this.cmsService.listFooterSections();
  }

  @Post('footer/sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create footer section' })
  createFooterSection(@Body() data: CreateFooterSectionDto) {
    return this.cmsService.createFooterSection(data);
  }

  @Put('footer/sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update footer section' })
  updateFooterSection(@Param('id') id: string, @Body() data: UpdateFooterSectionDto) {
    return this.cmsService.updateFooterSection(id, data);
  }

  @Delete('footer/sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete footer section' })
  deleteFooterSection(@Param('id') id: string) {
    return this.cmsService.deleteFooterSection(id);
  }

  // Footer Links
  @Post('footer/links')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create footer link' })
  createFooterLink(@Body() data: CreateFooterLinkDto) {
    return this.cmsService.createFooterLink(data);
  }

  @Put('footer/links/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update footer link' })
  updateFooterLink(@Param('id') id: string, @Body() data: UpdateFooterLinkDto) {
    return this.cmsService.updateFooterLink(id, data);
  }

  @Delete('footer/links/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete footer link' })
  deleteFooterLink(@Param('id') id: string) {
    return this.cmsService.deleteFooterLink(id);
  }

  // Footer Config
  @Get('footer/config')
  @ApiOperation({ summary: 'Get footer config' })
  getFooterConfig() {
    return this.cmsService.getFooterConfig();
  }

  @Put('footer/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update footer config' })
  updateFooterConfig(@Body() data: UpdateFooterConfigDto) {
    return this.cmsService.updateFooterConfig(data);
  }

  @Post('footer/seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed default footer data (admin)' })
  seedFooter() {
    return this.cmsService.seedFooter();
  }
}
