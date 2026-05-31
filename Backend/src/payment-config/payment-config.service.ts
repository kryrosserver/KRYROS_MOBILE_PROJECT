import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentConfigService {
  constructor(private prisma: PrismaService) {}

  // ── All methods (admin) ─────────────────────────────────────────────────
  async getMethods() {
    return this.prisma.paymentMethod.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        providers: {
          orderBy: { sortOrder: 'asc' },
          include: { networks: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
  }

  // ── Enabled methods only (public – customer frontend) ──────────────────
  async getEnabledMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        providers: {
          where: { isEnabled: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            networks: {
              where: { isEnabled: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  // ── Payment Method CRUD ─────────────────────────────────────────────────
  async createMethod(data: { name: string; type: string; icon?: string }) {
    const last = await this.prisma.paymentMethod.findFirst({ orderBy: { sortOrder: 'desc' } });
    return this.prisma.paymentMethod.create({
      data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
  }

  async updateMethod(id: string, data: Partial<{ name: string; type: string; icon: string; sortOrder: number; isEnabled: boolean }>) {
    return this.prisma.paymentMethod.update({ where: { id }, data });
  }

  async deleteMethod(id: string) {
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  async reorderMethods(orders: { id: string; sortOrder: number }[]) {
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        this.prisma.paymentMethod.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { success: true };
  }

  // ── Provider CRUD ───────────────────────────────────────────────────────
  async getProviders(methodId: string) {
    return this.prisma.paymentProvider.findMany({
      where: { paymentMethodId: methodId },
      orderBy: { sortOrder: 'asc' },
      include: { networks: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async createProvider(data: {
    paymentMethodId: string;
    name: string;
    description?: string;
    config?: Record<string, unknown>;
  }) {
    const last = await this.prisma.paymentProvider.findFirst({
      where: { paymentMethodId: data.paymentMethodId },
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.paymentProvider.create({
      data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
      include: { networks: true },
    });
  }

  async updateProvider(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      config: Record<string, unknown>;
      sortOrder: number;
      isEnabled: boolean;
    }>,
  ) {
    return this.prisma.paymentProvider.update({
      where: { id },
      data,
      include: { networks: true },
    });
  }

  async deleteProvider(id: string) {
    return this.prisma.paymentProvider.delete({ where: { id } });
  }

  // ── Network CRUD ────────────────────────────────────────────────────────
  async getNetworks(providerId: string) {
    return this.prisma.paymentNetwork.findMany({
      where: { providerId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createNetwork(data: { providerId: string; name: string }) {
    const last = await this.prisma.paymentNetwork.findFirst({
      where: { providerId: data.providerId },
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.paymentNetwork.create({
      data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
  }

  async updateNetwork(id: string, data: Partial<{ name: string; sortOrder: number; isEnabled: boolean }>) {
    return this.prisma.paymentNetwork.update({ where: { id }, data });
  }

  async deleteNetwork(id: string) {
    return this.prisma.paymentNetwork.delete({ where: { id } });
  }
}
