import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() createUserDto: CreateUserDto, @Request() req) {
    // If a privileged role is requested, verify the requester is a SUPER_ADMIN
    if (createUserDto.role && createUserDto.role !== UserRole.CUSTOMER) {
      // Manual check for JWT since register is generally public
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing for privileged role creation');
      }
      
      const token = authHeader.split(' ')[1];
      const payload = await this.authService.validateToken(token);
      
      if (!payload || payload.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only Super Admins can create accounts with privileged roles');
      }
    }

    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@Request() req) {
    return req.user;
  }
}
