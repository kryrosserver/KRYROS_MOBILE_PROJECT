import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getRange(range: string) {
    const now = new Date();
    const start = new Date();
    if (range === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (range === 'quarter') {
      start.setMonth(now.getMonth() - 3);
    } else {
      start.setFullYear(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
    }
    return { start, end: now };
  }

  async summary(range = 'year') {
    const { start, end } = this.getRange(range);

    const [orders, usersCount, creditAccounts] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, total: true, status: true, paymentStatus: true, createdAt: true, userId: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.count(),
      this.prisma.creditAccount.findMany().catch(() => []),
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
      .reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const activeUsers = usersCount;
    const creditDisbursed = creditAccounts.reduce<number>((s, c: any) => s + Number(c.amount || 0), 0);

    const byMonth: Record<string, { revenue: number; orders: number }> = {};
    for (const o of orders) {
      const k = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[k]) byMonth[k] = { revenue: 0, orders: 0 };
      byMonth[k].orders += 1;
      if (o.paymentStatus === 'PAID' || o.status === 'DELIVERED') {
        byMonth[k].revenue += Number(o.total);
      }
    }
    const labels = Object.keys(byMonth).sort();
    const revenueSeries = labels.map((k) => {
      const d = new Date(Number(k.split('-')[0]), Number(k.split('-')[1]) - 1, 1);
      const m = d.toLocaleString('en-US', { month: 'short' });
      return { label: m, revenue: byMonth[k].revenue, orders: byMonth[k].orders };
    });

    const orderItems = await this.prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: start, lte: end } } },
      include: { product: { select: { name: true, categoryId: true, category: { select: { name: true } } } } },
    });
    const productAgg: Record<string, { name: string; sales: number; revenue: number }> = {};
    const categoryAgg: Record<string, number> = {};
    for (const it of orderItems) {
      const key = it.product?.name || it.productId;
      if (!productAgg[key]) productAgg[key] = { name: key, sales: 0, revenue: 0 };
      productAgg[key].sales += it.quantity;
      productAgg[key].revenue += Number(it.total);
      const cat = it.product?.category?.name || 'Other';
      categoryAgg[cat] = (categoryAgg[cat] || 0) + Number(it.total);
    }
    const topProducts = Object.values(productAgg)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({ ...p, growth: 0 }));
    const catTotal = Object.values(categoryAgg).reduce((a, b) => a + b, 0) || 1;
    const salesByCategory = Object.entries(categoryAgg).map(([name, val]) => ({
      name,
      value: Math.round((val / catTotal) * 100),
    }));

    const recentOrders = await this.prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    const recentTransactions = recentOrders.map((o) => ({
      id: o.orderNumber,
      customer: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email : 'Unknown',
      amount: Number(o.total),
      status: o.paymentStatus.toLowerCase(),
      date: o.createdAt.toISOString().slice(0, 10),
    }));

    const credit = {
      activeAccounts: creditAccounts.filter((c: any) => c.status === 'ACTIVE').length,
      totalOutstanding: creditAccounts.reduce<number>((s, c: any) => s + Number(c.remainingAmount || 0), 0),
      repaymentRate: 0,
      defaultRate: (creditAccounts.filter((c: any) => c.status === 'DEFAULTED').length / (creditAccounts.length || 1)) * 100,
    };

    return {
      stats: { totalRevenue, totalOrders, activeUsers, creditDisbursed },
      revenueSeries,
      topProducts,
      recentTransactions,
      credit,
      salesByCategory,
    };
  }
}
