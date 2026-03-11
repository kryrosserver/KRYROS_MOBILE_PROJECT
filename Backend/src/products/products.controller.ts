import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductFlagsDto } from './dto/update-product-flags.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all products' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: boolean,
  ) {
    return this.productsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      categoryId,
      search,
      isFeatured: featured,
    });
  }

  @Get('featured')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('take') take?: number) {
    return this.productsService.getFeaturedProducts(take ? Number(take) : undefined);
  }

  @Get('flash-sales')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get flash sale products' })
  getFlashSales() {
    return this.productsService.getFlashSaleProducts();
  }

  @Put(':id/flags')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product feature/flash flags' })
  updateFlags(@Param('id') id: string, @Body() body: UpdateProductFlagsDto) {
    return this.productsService.updateFlags(id, body);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  @ApiOperation({ summary: 'Create product with image files (multipart/form-data)' })
  createUpload(@Body() body: CreateProductDto, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
    const imgs = files?.images || [];
    return this.productsService.createWithFiles(body, imgs);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product details' })
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  @Post(':id/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  @ApiOperation({ summary: 'Update product with image files (multipart/form-data)' })
  updateUpload(@Param('id') id: string, @Body() body: UpdateProductDto, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
    const imgs = files?.images || [];
    return this.productsService.updateWithFiles(id, body, imgs);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed sample products for initial setup' })
  seed() {
    return this.productsService.seedSampleProducts();
  }

  @Post('flash-sales/seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed flash sale deals for testing' })
  seedFlash() {
    return this.productsService.seedFlashSales();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (hard delete or soft fallback)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
