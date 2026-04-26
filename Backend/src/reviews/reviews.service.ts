import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateReviewDto) {
    // 1. Verify if user actually purchased the product
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    if (!orderItem) {
      throw new BadRequestException('You can only review products you have purchased and received.');
    }

    // 2. Create the review
    return this.prisma.review.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        comment: data.comment,
        imageUrl: data.imageUrl,
        isVerified: true,
        isApproved: true, // Default to approved for now, can be changed to false if moderation is needed
      },
    });
  }

  async findAll(params: {
    productId?: string;
    isFeatured?: boolean;
    isApproved?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { productId, isFeatured, isApproved, skip, take } = params;
    
    const where: any = {};
    if (productId) where.productId = productId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isApproved !== undefined) where.isApproved = isApproved;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: skip || 0,
        take: take || 20,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              name: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data: reviews, meta: { total, skip, take } };
  }

  async updateStatus(id: string, data: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.delete({ where: { id } });
  }

  async getProductRating(productId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating || 0,
    };
  }
}
