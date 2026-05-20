import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email already subscribed');
      }
      return this.prisma.newsletter.update({
        where: { email },
        data: { isActive: true },
      });
    }

    return this.prisma.newsletter.create({
      data: { email },
    });
  }

  async unsubscribe(email: string) {
    return this.prisma.newsletter.update({
      where: { email },
      data: { isActive: false },
    });
  }

  async findAll() {
    return this.prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
