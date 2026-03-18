import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateLocationShippingMethodDto } from './dto/create-location-shipping-method.dto';

@Injectable()
export class ShippingZonesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureGlobalDefaultZone();
    await this.migrateOldShippingMethods();
    await this.ensureFeatureFlag();
  }

  private async ensureGlobalDefaultZone() {
    const globalZone = await this.prisma.shippingZone.findUnique({
      where: { name: 'Global Default' },
    });

    if (!globalZone) {
      await this.prisma.shippingZone.create({
        data: {
          name: 'Global Default',
          priority: 0,
        },
      });
    }
  }

  private async migrateOldShippingMethods() {
    const globalZone = await this.prisma.shippingZone.findUnique({
      where: { name: 'Global Default' },
      include: { shippingMethods: true },
    });

    if (!globalZone) return;

    // Only migrate if global zone has no methods yet
    if (globalZone.shippingMethods.length === 0) {
      const oldMethods = await this.prisma.shippingMethod.findMany({
        where: { isActive: true },
      });

      for (const old of oldMethods) {
        await this.prisma.locationShippingMethod.create({
          data: {
            zoneId: globalZone.id,
            name: old.name,
            price: old.fee,
            freeShippingThreshold: old.minThreshold,
            estimatedDays: old.estimatedDays,
            status: old.isActive,
          },
        });
      }
    }
  }

  private async ensureFeatureFlag() {
    const flag = await this.prisma.setting.findUnique({
      where: { key: 'ENABLE_LOCATION_SHIPPING' },
    });

    if (!flag) {
      await this.prisma.setting.create({
        data: {
          key: 'ENABLE_LOCATION_SHIPPING',
          value: 'false',
          type: 'boolean',
          category: 'shipping',
        },
      });
    }
  }

  async isEnabled() {
    const flag = await this.prisma.setting.findUnique({
      where: { key: 'ENABLE_LOCATION_SHIPPING' },
    });
    return flag?.value === 'true';
  }

  async toggleFeature(enabled: boolean) {
    return this.prisma.setting.update({
      where: { key: 'ENABLE_LOCATION_SHIPPING' },
      data: { value: String(enabled) },
    });
  }

  async create(createShippingZoneDto: CreateShippingZoneDto) {
    return this.prisma.shippingZone.create({
      data: createShippingZoneDto,
    });
  }

  async findAll() {
    return this.prisma.shippingZone.findMany({
      include: {
        country: true,
        state: true,
        city: true,
        _count: {
          select: { shippingMethods: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    return this.prisma.shippingZone.findUnique({
      where: { id },
      include: {
        country: true,
        state: true,
        city: true,
        shippingMethods: true,
      },
    });
  }

  async update(id: string, updateShippingZoneDto: UpdateShippingZoneDto) {
    return this.prisma.shippingZone.update({
      where: { id },
      data: updateShippingZoneDto,
    });
  }

  async remove(id: string) {
    return this.prisma.shippingZone.delete({
      where: { id },
    });
  }

  // Shipping Methods
  async addMethod(dto: CreateLocationShippingMethodDto) {
    return this.prisma.locationShippingMethod.create({
      data: dto,
    });
  }

  async updateMethod(id: string, data: any) {
    return this.prisma.locationShippingMethod.update({
      where: { id },
      data,
    });
  }

  async removeMethod(id: string) {
    return this.prisma.locationShippingMethod.delete({
      where: { id },
    });
  }

  // MATCHING LOGIC (VERY IMPORTANT)
  async findMatchingMethods(countryId?: string, stateId?: string, cityId?: string) {
    // 1. Try matching by city_id
    if (cityId) {
      const zone = await this.prisma.shippingZone.findFirst({
        where: { cityId, isActive: true },
        include: { shippingMethods: { where: { status: true } } },
        orderBy: { priority: 'desc' },
      });
      if (zone && zone.shippingMethods.length > 0) return zone.shippingMethods;
    }

    // 2. Try matching by state_id
    if (stateId) {
      const zone = await this.prisma.shippingZone.findFirst({
        where: { stateId, isActive: true },
        include: { shippingMethods: { where: { status: true } } },
        orderBy: { priority: 'desc' },
      });
      if (zone && zone.shippingMethods.length > 0) return zone.shippingMethods;
    }

    // 3. Try matching by country_id
    if (countryId) {
      const zone = await this.prisma.shippingZone.findFirst({
        where: { countryId, isActive: true },
        include: { shippingMethods: { where: { status: true } } },
        orderBy: { priority: 'desc' },
      });
      if (zone && zone.shippingMethods.length > 0) return zone.shippingMethods;
    }

    // 4. Fallback to GLOBAL zone
    const globalZone = await this.prisma.shippingZone.findFirst({
      where: { 
        countryId: null, 
        stateId: null, 
        cityId: null, 
        isActive: true 
      },
      include: { shippingMethods: { where: { status: true } } },
    });

    return globalZone ? globalZone.shippingMethods : [];
  }
}
