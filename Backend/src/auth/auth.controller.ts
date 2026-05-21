import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: Pick<JwtPayload, 'sub' | 'email' | 'role'> & { id: string };
  headers: Record<string, string>;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (createUserDto.role && createUserDto.role !== UserRole.CUSTOMER) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException(
          'Authorization required to create privileged accounts',
        );
      }
      const token = authHeader.split(' ')[1];
      const payload = await this.authService.validateToken(token);
      if (!payload || payload.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only Super Admins can create privileged accounts');
      }
    }
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Login with email/phone and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@Body() body: RefreshTokenDto) {
    if (body.refreshToken) {
      await this.authService.logout(body.refreshToken);
    }
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current user' })
  async logoutAll(@Request() req: AuthenticatedRequest) {
    await this.authService.logoutAll(req.user.id);
  }

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Request a password reset token' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(body.identifier);
    return {
      message: 'If an account with that identifier exists, a reset token has been issued.',
      ...(result.resetToken ? { resetToken: result.resetToken } : {}),
    };
  }

  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using a reset token' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
