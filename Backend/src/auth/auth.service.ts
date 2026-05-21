import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private buildPayload(user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
  }): Omit<JwtPayload, 'iat' | 'exp' | 'type'> {
    return { sub: user.id, email: user.email, phone: user.phone, role: user.role };
  }

  private signTokens(payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>) {
    return {
      accessToken: this.jwtService.sign({ ...payload, type: 'access' }, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign({ ...payload, type: 'refresh' }, { expiresIn: '7d' }),
    };
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
      ...this.signTokens(this.buildPayload(user)),
    };
  }

  async register(createUserDto: CreateUserDto) {
    if (!createUserDto.email && !createUserDto.phone) {
      throw new ConflictException('Either email or phone is required');
    }

    if (createUserDto.email) {
      const existingEmail = await this.usersService.findByEmail(createUserDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    if (createUserDto.phone) {
      const existingPhone = await this.usersService.findByPhone(createUserDto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password: _pw, ...result } = user;

    return {
      user: result,
      ...this.signTokens(this.buildPayload(result)),
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not found or deactivated');
    }

    return {
      accessToken: this.jwtService.sign(
        { ...this.buildPayload(user), type: 'access' },
        { expiresIn: '15m' },
      ),
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
