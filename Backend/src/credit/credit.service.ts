import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.creditProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.creditProfile.create({
        data: { userId, creditLimit: 0, creditScore: 500 },
      });
    }
    return profile;
  }

  async getPlans() {
    return this.prisma.creditPlan.findMany({ where: { isActive: true } });
  }

  async getAccounts(userId: string) {
    return this.prisma.creditAccount.findMany({
      where: { userId },
      include: { 
        product: {
          include: { images: { where: { isPrimary: true } } }
        }, 
        creditPlan: true, 
        payments: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAccounts(params: { skip?: number; take?: number; status?: string }) {
    const { skip = 0, take = 20, status } = params;
    const where: any = {};
    if (status) where.status = status;

    const [accounts, total] = await Promise.all([
      this.prisma.creditAccount.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          product: { select: { id: true, name: true, price: true } },
          creditPlan: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditAccount.count({ where }),
    ]);

    return { data: accounts, meta: { total, skip, take } };
  }

  async updateAccountStatus(id: string, status: string) {
    return this.prisma.creditAccount.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async calculateInstallment(amount: number, planId: string) {
    const plan = await this.prisma.creditPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Credit plan not found');
    
    const interest = Number(amount) * (Number(plan.interestRate) / 100);
    const totalPayable = Number(amount) + interest;
    const monthlyPayment = totalPayable / plan.duration;
    
    return { totalPayable, monthlyPayment, interest, plan };
  }

  async applyForCredit(userId: string, data: { productId: string; planId: string; amount: number }) {
    const { productId, planId, amount } = data;
    
    // Check product allows credit
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.allowCredit) {
      throw new NotFoundException('Product not found or credit not allowed for this product');
    }

    // Check credit profile
    const profile = await this.getProfile(userId);
    if (profile.status !== 'ACTIVE') {
      throw new Error('Credit profile is not active');
    }

    // Check available credit
    if (Number(profile.availableCredit) < amount) {
      throw new Error('Insufficient available credit');
    }

    const calculation = await this.calculateInstallment(amount, planId);
    
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.creditAccount.create({
        data: {
          userId,
          productId,
          creditPlanId: planId,
          creditProfileId: profile.id,
          amount: amount,
          totalPayable: calculation.totalPayable,
          monthlyPayment: calculation.monthlyPayment,
          remainingAmount: calculation.totalPayable,
          nextPaymentDate,
          status: 'ACTIVE',
        },
      });

      // Update profile
      await tx.creditProfile.update({
        where: { id: profile.id },
        data: {
          availableCredit: { decrement: amount },
          usedCredit: { increment: amount },
        },
      });

      return account;
    });
  }
}
