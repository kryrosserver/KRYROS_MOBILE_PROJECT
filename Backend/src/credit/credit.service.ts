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
      include: { product: true, creditPlan: true, payments: true },
      orderBy: { createdAt: 'desc' },
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
}
