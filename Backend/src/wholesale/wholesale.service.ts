import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WholesaleService {
  constructor(private prisma: PrismaService) {}

  async getAccount(userId: string) {
    return this.prisma.wholesaleAccount.findUnique({
      where: { userId },
      include: { user: true, prices: true },
    });
  }

  async findAllAccounts(status?: string) {
    return this.prisma.wholesaleAccount.findMany({
      where: status ? { status: status as any } : {},
      include: { 
        user: { 
          select: { firstName: true, lastName: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAccountStatus(id: string, status: string, notes?: string) {
    return this.prisma.wholesaleAccount.update({
      where: { id },
      data: { status: status as any, notes },
    });
  }

  async apply(data: any) {
    return this.prisma.wholesaleAccount.create({ 
      data: {
        ...data,
        status: 'PENDING'
      } 
    });
  }

  // Tiered Pricing for Products
  async setProductWholesalePrices(productId: string, prices: { minQuantity: number, price: number, accountId?: string }[]) {
    // 1. Delete existing for this product (optionally filter by accountId)
    await this.prisma.wholesalePrice.deleteMany({
      where: { productId }
    });

    // 2. Create new ones
    return this.prisma.wholesalePrice.createMany({
      data: prices.map(p => ({
        productId,
        minQuantity: p.minQuantity,
        price: p.price,
        accountId: p.accountId || null
      }))
    });
  }

  async getProductWholesalePrices(productId: string) {
    return this.prisma.wholesalePrice.findMany({
      where: { productId },
      orderBy: { minQuantity: 'asc' }
    });
  }
}
