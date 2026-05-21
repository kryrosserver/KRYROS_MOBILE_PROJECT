import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

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

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifier(loginDto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email address is not verified');
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

  async forgotPassword(identifier: string): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      return { resetToken: '' };
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

    return { resetToken: rawToken };
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
