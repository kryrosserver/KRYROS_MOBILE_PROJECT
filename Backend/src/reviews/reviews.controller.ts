import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    // If user is logged in (has a token), pass their ID. If not, pass null (Guest).
    const userId = req.user?.id || null;
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Get()
  findAll(
    @Query('productId') productId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isApproved') isApproved?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.reviewsService.findAll({
      productId,
      isFeatured: isFeatured === 'true',
      isApproved: isApproved === 'true',
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get('product/:productId/rating')
  getProductRating(@Param('productId') productId: string) {
    return this.reviewsService.getProductRating(productId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() updateReviewStatusDto: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, updateReviewStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
