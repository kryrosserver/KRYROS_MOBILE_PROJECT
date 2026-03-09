import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductFlagsDto } from './dto/update-product-flags.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('take') take?: number) {
    return this.productsService.getFeaturedProducts(take ? Number(take) : undefined);
  }

  @Get('flash-sales')
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
}
