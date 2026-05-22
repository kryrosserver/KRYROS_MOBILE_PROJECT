import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compressImage } from '../common/utils/image.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        description: true,
        sortOrder: true,
        showOnHome: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getHomepageCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true, showOnHome: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, products: { take: 10 } },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: { take: 10 } },
    });
  }

  async create(data: any) {
    if (data.image) {
      data.image = await compressImage(data.image, 400, 400, 60); // Smaller for categories
    }
    return this.prisma.category.create({
      data: {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  async update(id: string, data: any) {
    if (data.image) {
      data.image = await compressImage(data.image, 400, 400, 60);
    }
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
