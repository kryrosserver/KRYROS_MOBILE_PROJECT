import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w-]+/g, '')   // Remove all non-word chars
      .replace(/--+/g, '-');    // Replace multiple - with single -
  }

  async create(dto: CreateBrandDto) {
    const slug = dto.slug || this.slugify(dto.name);
    
    // Check for existing slug
    const existing = await this.prisma.brand.findUnique({
      where: { slug }
    });

    if (existing) {
      throw new ConflictException(`Brand with slug "${slug}" already exists`);
    }

    try {
      return await this.prisma.brand.create({
        data: {
          name: dto.name,
          slug,
          logo: dto.logo || null,
          description: dto.description || null,
          website: dto.website || null,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          categoryId: dto.categoryId || null,
        },
      });
    } catch (e) {
      console.error('Brand creation error:', e);
      throw new Error(`Database error: ${e.message}`);
    }
  }

  async findAll() {
    try {
      return await this.prisma.brand.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { name: 'asc' },
      });
    } catch (e) {
      console.error('Failed to load brands due to DB corruption:', e.message);
      return []; // Return empty list instead of crashing
    }
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: true
      }
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto) {
    await this.findOne(id);
    
    const data: any = { ...dto };
    if (dto.name && !dto.slug) {
      data.slug = this.slugify(dto.name);
    }

    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand.delete({
      where: { id },
    });
  }

  async cleanupCorruptedData() {
    console.log('Running database cleanup and maintenance...');
    
    // 1. Reset all products to have NO brandId (fixes the string vs int mismatch)
    const updatedProducts = await this.prisma.product.updateMany({
      data: {
        brandId: null
      }
    });

    // 2. Clear out the brands table entirely to fix the ID type issue
    try {
      // TRUNCATE is safer for resetting autoincrement IDs
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "brands" RESTART IDENTITY CASCADE;');
    } catch (e) {
      console.warn('Truncate failed, trying deleteMany...', e.message);
      await this.prisma.brand.deleteMany({});
    }

    // 3. Ensure Category table has showOnHome column if db push failed
    try {
      await this.prisma.$executeRawUnsafe('ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "showOnHome" BOOLEAN DEFAULT false;');
    } catch (e) {
      console.warn('Failed to add column showOnHome via SQL:', e.message);
    }

    return { 
      message: 'Database cleanup and maintenance complete', 
      productsUpdated: updatedProducts.count,
      brandsCleared: true
    };
  }
}
