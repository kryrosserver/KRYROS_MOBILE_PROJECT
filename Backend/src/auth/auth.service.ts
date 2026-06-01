import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateOpaqueToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ── Failed-login lockout (in-memory, sliding window) ─────────────────────
  private lockKey(id: string): string {
    return `login_lock:${id.toLowerCase().trim()}`;
  }

  private async checkLockout(identifier: string): Promise<void> {
    const attempts = (await this.cacheManager.get<number>(this.lockKey(identifier))) ?? 0;
    if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      throw new UnauthorizedException(
        'Too many failed attempts. Account temporarily locked for 15 minutes.',
      );
    }
  }

  private async recordFailedAttempt(identifier: string): Promise<void> {
    const key = this.lockKey(identifier);
    const attempts = (await this.cacheManager.get<number>(key)) ?? 0;
    await this.cacheManager.set(key, attempts + 1, LOCKOUT_TTL_MS);
  }

  private async clearFailedAttempts(identifier: string): Promise<void> {
    await this.cacheManager.del(this.lockKey(identifier));
  }

  private buildPayload(user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
  }): Omit<JwtPayload, 'iat' | 'exp' | 'type'> {
    return { sub: user.id, email: user.email, phone: user.phone, role: user.role };
  }

  private signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>): string {
    return this.jwtService.sign({ ...payload, type: 'access' }, { expiresIn: '15m' });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const raw = generateOpaqueToken();
    const tokenHash = hashToken(raw);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
    return raw;
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    if (!user.isActive) return null;
    const { password: _pw, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    // Check lockout BEFORE any DB work to stop brute-force early
    await this.checkLockout(loginDto.identifier);

    const user = await this.usersService.findByIdentifier(loginDto.identifier);

    if (!user) {
      // Record attempt even for unknown identifiers (prevents enumeration via timing)
      await this.recordFailedAttempt(loginDto.identifier);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(loginDto.identifier);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Successful credential check — clear failed attempts
    await this.clearFailedAttempts(loginDto.identifier);

    // Auto-verify users on successful login (no email verification flow exists)
    if (!user.isVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    if ((user as any).twoFactorEnabled) {
      const twoFactorToken = this.jwtService.sign(
        { sub: user.id, type: '2fa-pending' },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, twoFactorToken };
    }

    const payload = this.buildPayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(payload)),
      this.createRefreshToken(user.id),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async completeTwoFactorLogin(user: { id: string; email: string | null; phone: string | null; role: string; firstName: string; lastName: string; avatar: string | null }) {
    const payload = this.buildPayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(payload)),
      this.createRefreshToken(user.id),
    ]);
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto) {
    if (!createUserDto.email && !createUserDto.phone) {
      throw new ConflictException('Either email or phone is required');
    }

    if (createUserDto.email) {
      const existing = await this.usersService.findByEmail(createUserDto.email);
      if (existing) throw new ConflictException('Email already registered');
    }

    if (createUserDto.phone) {
      const existing = await this.usersService.findByPhone(createUserDto.phone);
      if (existing) throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      isVerified: true,
    });

    const { password: _pw, ...result } = user;
    const payload = this.buildPayload(result);
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(payload)),
      this.createRefreshToken(result.id),
    ]);

    return { user: result, accessToken, refreshToken };
  }

  async refreshToken(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { tokenHash } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user || !user.isActive) {
      await this.prisma.refreshToken.delete({ where: { tokenHash } });
      throw new UnauthorizedException('Account not found or deactivated');
    }

    await this.prisma.refreshToken.delete({ where: { tokenHash } });

    const payload = this.buildPayload(user);
    const [accessToken, newRefreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(payload)),
      this.createRefreshToken(user.id),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async forgotPassword(identifier: string): Promise<void> {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      // Return silently — do not leak whether the account exists
      return;
    }

    const rawToken = generateOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expires,
      },
    });

    // TODO: Deliver rawToken via email/SMS to user.email or user.phone
    // Do NOT return or log the raw token in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset token for ${identifier}: ${rawToken}`);
    }
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(rawToken);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        isVerified: true,
      },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
