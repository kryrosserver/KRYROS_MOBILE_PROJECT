import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CMSService {
  constructor(private prisma: PrismaService) {}

  async getBanners() {
    return this.prisma.cMSBanner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  async getSections() {
    return this.prisma.cMSSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getPage(slug: string).prisma.cMS {
    return thisPage.findUnique({ where: { slug } });
  }
}
