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

  async updateFlags(id: string, data: { isFeatured?: boolean; isFlashSale?: boolean; flashSaleEnd?: string | null; flashSalePrice?: number | null }) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : undefined,
        isFlashSale: typeof data.isFlashSale === 'boolean' ? data.isFlashSale : undefined,
        flashSaleEnd: data.flashSaleEnd !== undefined ? (data.flashSaleEnd ? new Date(data.flashSaleEnd) : null) : undefined,
        flashSalePrice: data.flashSalePrice !== undefined ? data.flashSalePrice : undefined,
      },
    });
    return product;
  }

  async seedSampleProducts() {
    const category = await this.prisma.category.upsert({
      where: { slug: 'general' },
      update: {},
      create: { name: 'General', slug: 'general', isActive: true, sortOrder: 0 },
    });

    const brand = await this.prisma.brand.upsert({
      where: { slug: 'kryros' },
      update: {},
      create: { name: 'Kryros', slug: 'kryros' },
    });

    const samples = [
      {
        name: 'iPhone 13 Pro',
        slug: 'iphone-13-pro',
        description: 'Apple iPhone 13 Pro with A15 Bionic and ProMotion display.',
        price: 18500,
        sku: 'IP13PRO-256-GRY',
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1632633178775-8b3083a0b20e?w=1200',
      },
      {
        name: 'HP EliteBook x360 G8',
        slug: 'hp-elitebook-x360-g8',
        description: 'Premium business convertible with powerful performance.',
        price: 22000,
        sku: 'HP-EBX360-G8',
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
      },
      {
        name: 'Samsung Galaxy S22',
        slug: 'samsung-galaxy-s22',
        description: 'Flagship smartphone with dynamic AMOLED display.',
        price: 16500,
        sku: 'SM-GS22-128-BLK',
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
      },
    ];

    const created: any[] = [];
    for (const s of samples) {
      const p = await this.prisma.product.upsert({
        where: { slug: s.slug },
        update: {},
        create: {
          name: s.name,
          slug: s.slug,
          description: s.description,
          shortDescription: s.description,
          price: s.price,
          sku: s.sku,
          isFeatured: s.isFeatured,
          categoryId: category.id,
          brandId: brand.id,
          isActive: true,
        },
      });
      // Ensure primary image exists
      const hasImage = await this.prisma.productImage.findFirst({ where: { productId: p.id, isPrimary: true } });
      if (!hasImage) {
        await this.prisma.productImage.create({
          data: { productId: p.id, url: s.image, alt: p.name, isPrimary: true, sortOrder: 0 },
        });
      }
      created.push(p);
    }
    return { success: true, count: created.length, products: created };
  }
}
