import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping-method.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShippingMethodDto) {
    try {
      return await this.prisma.shippingMethod.create({
        data: {
          name: dto.name,
          description: dto.description,
          fee: new Prisma.Decimal(dto.fee),
          minThreshold: new Prisma.Decimal(dto.minThreshold ?? 0),
          estimatedDays: dto.estimatedDays,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      console.error('Prisma Error creating shipping method:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.shippingMethod.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Prisma Error fetching shipping methods:', error);
      throw error;
    }
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
    
    const updateData: any = { ...dto };
    if (dto.fee !== undefined) updateData.fee = new Prisma.Decimal(dto.fee);
    if (dto.minThreshold !== undefined) updateData.minThreshold = new Prisma.Decimal(dto.minThreshold);

    try {
      return await this.prisma.shippingMethod.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error('Prisma Error updating shipping method:', error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shippingMethod.delete({
      where: { id },
    });
  }
}
