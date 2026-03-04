import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, params: { skip?: number; take?: number; status?: string }) {
    const { skip = 0, take = 20, status } = params;
    const where: any = userId ? { userId } : {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, meta: { total, skip, take } };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: { include: { images: true } }, variant: true } },
        shippingAddress: true,
        billingAddress: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: any) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return this.prisma.order.create({
      data: { ...data, orderNumber },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
