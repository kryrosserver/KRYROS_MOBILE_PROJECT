import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    categoryId?: string;
    search?: string;
    isFeatured?: boolean;
  }) {
    const { skip = 0, take = 20, categoryId, search, isFeatured } = params;
    
    const where: any = { isActive: true };
    
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured) where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          brand: true,
          images: { where: { isPrimary: true } },
          inventory: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, meta: { total, skip, take } };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        inventory: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        inventory: true,
        relatedProducts: {
          include: { related: { include: { images: { where: { isPrimary: true } } } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getFeaturedProducts(take = 10) {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take,
      include: {
        category: true,
        images: { where: { isPrimary: true } },
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFlashSaleProducts() {
    const now = new Date();
    return this.prisma.product.findMany({
      where: {
        isFlashSale: true,
        isActive: true,
        flashSaleEnd: { gt: now },
      },
      include: {
        category: true,
        images: { where: { isPrimary: true } },
        inventory: true,
      },
    });
  }
}
