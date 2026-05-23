import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default settings if they don't exist
    const defaultSettings = [
      { key: 'shipping_fee', value: '25', type: 'number', category: 'shipping' },
      { key: 'free_shipping_threshold', value: '500', type: 'number', category: 'shipping' },
      { key: 'free_shipping_target_qty', value: '50', type: 'number', category: 'shipping' },
      { key: 'free_shipping_min_price', value: '100', type: 'number', category: 'shipping' },
      { key: 'opening_time', value: '08:00', type: 'string', category: 'general' },
      { key: 'closing_time', value: '18:00', type: 'string', category: 'general' },
      { key: 'is_store_closed_manual', value: 'false', type: 'boolean', category: 'general' },
      { key: 'store_closed_message', value: 'We are currently closed. Please come back later.', type: 'string', category: 'general' },
      { key: 'whatsapp_number', value: process.env.WHATSAPP_NUMBER || '', type: 'string', category: 'contact' },
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
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { 
        key, 
        value, 
        type: 'string', 
        category: 'general' 
      },
    });
  }

  async getShippingConfig() {
    const [fee, threshold, targetQty, minPrice] = await Promise.all([
      this.getByKey('shipping_fee'),
      this.getByKey('free_shipping_threshold'),
      this.getByKey('free_shipping_target_qty'),
      this.getByKey('free_shipping_min_price'),
    ]);

    return {
      fee: Number(fee?.value || 50),
      threshold: Number(threshold?.value || 5000),
      targetQty: Number(targetQty?.value || 50),
      minPrice: Number(minPrice?.value || 100),
    };
  }
}
