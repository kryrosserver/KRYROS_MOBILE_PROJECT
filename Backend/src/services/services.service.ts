import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({ where: { isActive: true } });
  }

  async findById(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async book(data: any) {
    return this.prisma.serviceBooking.create({ data });
  }

  async listAll() {
    return this.prisma.service.findMany();
  }

  async create(data: {
    name: string; slug: string; description?: string; price: number; category: string; duration: string; image?: string; features?: string[]; isActive?: boolean;
  }) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: {
    name?: string; slug?: string; description?: string; price?: number; category?: string; duration?: string; image?: string; features?: string[]; isActive?: boolean;
  }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
