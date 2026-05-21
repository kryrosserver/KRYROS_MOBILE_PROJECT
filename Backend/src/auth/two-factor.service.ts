import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

// Use require to avoid TypeScript module resolution issues with the new otplib ESM build
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateSecret, verify } = require('otplib') as {
  generateSecret: () => string;
  verify: (opts: { secret: string; token: string }) => Promise<boolean>;
};

function buildOtpauthUrl(email: string, secret: string): string {
  const issuer = 'KRYROS Admin';
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
}

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  async generateSecret(userId: string, email: string): Promise<{ qrCodeUrl: string; secret: string }> {
    const secret = generateSecret();
    const otpauthUrl = buildOtpauthUrl(email, secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    return { qrCodeUrl, secret };
  }

  async enableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated. Call /auth/2fa/setup first.');
    }
    const isValid = await verify({ secret: user.twoFactorSecret, token: code });
    if (!isValid) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  async disableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled on this account');
    }
    const isValid = await verify({ secret: user.twoFactorSecret, token: code });
    if (!isValid) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
  }

  async verifyCode(secret: string, code: string): Promise<boolean> {
    return verify({ secret, token: code });
  }
}
