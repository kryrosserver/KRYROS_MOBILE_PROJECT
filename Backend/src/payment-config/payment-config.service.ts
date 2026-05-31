import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentConfigService {
  constructor(private prisma: PrismaService) {}

  // ── All methods (admin) ─────────────────────────────────────────────────
  async getMethods() {
    return this.prisma.checkoutMethod.findMany({
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
    return this.prisma.checkoutMethod.findMany({
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

  // ── CheckoutMethod CRUD ─────────────────────────────────────────────────
  async createMethod(data: { name: string; type: string; icon?: string }) {
    const last = await this.prisma.checkoutMethod.findFirst({ orderBy: { sortOrder: 'desc' } });
    return this.prisma.checkoutMethod.create({
      data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
  }

  async updateMethod(
    id: string,
    data: Partial<{ name: string; type: string; icon: string; sortOrder: number; isEnabled: boolean }>,
  ) {
    return this.prisma.checkoutMethod.update({ where: { id }, data });
  }

  async deleteMethod(id: string) {
    return this.prisma.checkoutMethod.delete({ where: { id } });
  }

  async reorderMethods(orders: { id: string; sortOrder: number }[]) {
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        this.prisma.checkoutMethod.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { success: true };
  }

  // ── CheckoutProvider CRUD ───────────────────────────────────────────────
  async getProviders(methodId: string) {
    return this.prisma.checkoutProvider.findMany({
      where: { checkoutMethodId: methodId },
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
    const last = await this.prisma.checkoutProvider.findFirst({
      where: { checkoutMethodId: data.paymentMethodId },
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.checkoutProvider.create({
      data: {
        checkoutMethodId: data.paymentMethodId,
        name: data.name,
        description: data.description,
        config: data.config,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
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
    return this.prisma.checkoutProvider.update({
      where: { id },
      data,
      include: { networks: true },
    });
  }

  async deleteProvider(id: string) {
    return this.prisma.checkoutProvider.delete({ where: { id } });
  }

  // ── CheckoutNetwork CRUD ────────────────────────────────────────────────
  async getNetworks(providerId: string) {
    return this.prisma.checkoutNetwork.findMany({
      where: { providerId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createNetwork(data: { providerId: string; name: string }) {
    const last = await this.prisma.checkoutNetwork.findFirst({
      where: { providerId: data.providerId },
      orderBy: { sortOrder: 'desc' },
    });
    return this.prisma.checkoutNetwork.create({
      data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
  }

  async updateNetwork(id: string, data: Partial<{ name: string; sortOrder: number; isEnabled: boolean }>) {
    return this.prisma.checkoutNetwork.update({ where: { id }, data });
  }

  async deleteNetwork(id: string) {
    return this.prisma.checkoutNetwork.delete({ where: { id } });
  }
}
