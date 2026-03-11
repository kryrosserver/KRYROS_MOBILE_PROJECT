import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({
      data: {
        ...dto,
      },
    });
  }

  async findAll() {
    return this.prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { fee: 'asc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });
    if (!method) throw new NotFoundException('Shipping method not found');
    return method;
  }

  async update(id: string, dto: UpdateShippingMethodDto) {
    await this.findOne(id);
    return this.prisma.shippingMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shippingMethod.delete({
      where: { id },
    });
  }
}
