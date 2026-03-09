import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, products: { take: 10 } },
    });
  }

  async seedSample() {
    const data = [
      { name: 'Smartphones', slug: 'smartphones', icon: 'phone', sortOrder: 1 },
      { name: 'Laptops', slug: 'laptops', icon: 'laptop', sortOrder: 2 },
      { name: 'Tablets', slug: 'tablets', icon: 'tablet', sortOrder: 3 },
      { name: 'Accessories', slug: 'accessories', icon: 'headphones', sortOrder: 4 },
      { name: 'Wearables', slug: 'wearables', icon: 'watch', sortOrder: 5 },
      { name: 'Software', slug: 'software', icon: 'software', sortOrder: 6 },
      { name: 'Audio', slug: 'audio', icon: 'speaker', sortOrder: 7 },
      { name: 'Gaming', slug: 'gaming', icon: 'gamepad', sortOrder: 8 },
    ];
    // createMany with skipDuplicates by unique slug
    const res = await this.prisma.category.createMany({
      data,
      skipDuplicates: true,
    });
    return { success: true, inserted: res.count };
  }
}
