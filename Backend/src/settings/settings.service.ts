import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default settings if they don't exist
    const defaultSettings = [
      { key: 'shipping_fee', value: '50', type: 'number', category: 'shipping' },
      { key: 'free_shipping_threshold', value: '5000', type: 'number', category: 'shipping' },
    ];

    for (const s of defaultSettings) {
      const existing = await this.prisma.setting.findUnique({ where: { key: s.key } });
      if (!existing) {
        await this.prisma.setting.create({ data: s });
      }
    }
  }

  async getAll() {
    return this.prisma.setting.findMany();
  }

  async getByKey(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async update(key: string, value: string) {
    return this.prisma.setting.update({
      where: { key },
      data: { value },
    });
  }

  async getShippingConfig() {
    const [fee, threshold] = await Promise.all([
      this.getByKey('shipping_fee'),
      this.getByKey('free_shipping_threshold'),
    ]);

    return {
      fee: Number(fee?.value || 50),
      threshold: Number(threshold?.value || 5000),
    };
  }
}
