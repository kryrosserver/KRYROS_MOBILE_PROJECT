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
}
