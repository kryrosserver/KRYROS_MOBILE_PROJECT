import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
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
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async create(dto: CreateBrandDto) {
    const slug = dto.slug || this.slugify(dto.name);

    const existing = await this.prisma.brand.findUnique({ where: { slug } });
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
    } catch (e: any) {
      throw new InternalServerErrorException(`Failed to create brand: ${e.message}`);
    }
  }

  async findAll() {
    try {
      return await this.prisma.brand.findMany({
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch {
      return [];
    }
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true },
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

    return this.prisma.brand.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }

  async cleanupCorruptedData() {
    const updatedProducts = await this.prisma.product.updateMany({ data: { brandId: null } });

    try {
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "brands" RESTART IDENTITY CASCADE;');
    } catch {
      await this.prisma.brand.deleteMany({});
    }

    try {
      await this.prisma.$executeRawUnsafe(
        'ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "showOnHome" BOOLEAN DEFAULT false;',
      );
    } catch {
      // Column may already exist — safe to ignore
    }

    return {
      message: 'Database cleanup complete',
      productsUpdated: updatedProducts.count,
      brandsCleared: true,
    };
  }
}
