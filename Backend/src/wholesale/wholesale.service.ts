import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WholesaleService {
  constructor(private prisma: PrismaService) {}

  async getAccount(userId: string) {
    return this.prisma.wholesaleAccount.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async apply(data: any) {
    return this.prisma.wholesaleAccount.create({ data });
  }
}
