import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping-method.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShippingMethodDto) {
    try {
      const method = await this.prisma.shippingMethod.create({
        data: {
          name: dto.name,
          description: dto.description,
          fee: new Prisma.Decimal(dto.fee),
          minThreshold: new Prisma.Decimal(dto.minThreshold ?? 0),
          estimatedDays: dto.estimatedDays,
          isActive: dto.isActive ?? true,
        },
      });

      // Sync with Location-based shipping system
      try {
        const globalZone = await this.prisma.shippingZone.findFirst({
          where: { countryId: null, stateId: null, cityId: null, name: 'Global Default' }
        });
        
        if (globalZone) {
          await this.prisma.locationShippingMethod.create({
            data: {
              zoneId: globalZone.id,
              name: method.name,
              price: method.fee,
              freeShippingThreshold: method.minThreshold,
              estimatedDays: method.estimatedDays,
              status: method.isActive
            }
          });
        }
      } catch (e) {
        console.error('Failed to sync new global method with location zones', e);
      }

      return method;
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
    const oldMethod = await this.findOne(id);
    
    const updateData: any = { ...dto };
    if (dto.fee !== undefined) updateData.fee = new Prisma.Decimal(dto.fee);
    if (dto.minThreshold !== undefined) updateData.minThreshold = new Prisma.Decimal(dto.minThreshold);

    try {
      const updated = await this.prisma.shippingMethod.update({
        where: { id },
        data: updateData,
      });

      // Update sync in location-based system
      try {
        const locationMethod = await this.prisma.locationShippingMethod.findFirst({
          where: { name: oldMethod.name }
        });
        
        if (locationMethod) {
          await this.prisma.locationShippingMethod.update({
            where: { id: locationMethod.id },
            data: {
              name: updated.name,
              price: updated.fee,
              freeShippingThreshold: updated.minThreshold,
              estimatedDays: updated.estimatedDays,
              status: updated.isActive
            }
          });
        }
      } catch (e) {
        console.error('Failed to sync updated global method with location zones', e);
      }

      return updated;
    } catch (error) {
      console.error('Prisma Error updating shipping method:', error);
      throw error;
    }
  }

  async remove(id: string) {
    const method = await this.findOne(id);
    
    // Remove sync in location-based system
    try {
      await this.prisma.locationShippingMethod.deleteMany({
        where: { name: method.name }
      });
    } catch (e) {
      console.error('Failed to remove synced location method', e);
    }

    return this.prisma.shippingMethod.delete({
      where: { id },
    });
  }
}
