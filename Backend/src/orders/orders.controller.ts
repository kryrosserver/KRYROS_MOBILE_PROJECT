import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (Admin/Manager only)' })
  findAll(@Query('status') status?: string, @Query('skip') skip?: number, @Query('take') take?: number) {
    return this.ordersService.findAll(undefined, {
      status,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  async myOrders(@Req() req: Request) {
    const result = await this.ordersService.findAll((req as any).user.id, { take: 20, skip: 0 });
    return result.data;
  }

  @Get('track')
  @ApiOperation({ summary: 'Track order by number and email (Public)' })
  async trackOrder(@Query('orderNumber') orderNumber: string, @Query('email') email: string) {
    if (!orderNumber || !email) {
      throw new BadRequestException('Both orderNumber and email are required');
    }
    return this.ordersService.trackOrder(orderNumber, email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID (owner or admin)' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    const order = await this.ordersService.findById(id);

    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(user.role);
    if (!isAdmin && order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order (authenticated or guest)' })
  create(@Req() req: Request, @Body() data: CreateOrderDto) {
    const userId = (req as any).user?.id;
    return this.ordersService.create(userId, data);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin/Manager only)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('paymentStatus') paymentStatus?: string,
  ) {
    return this.ordersService.updateStatus(id, status, paymentStatus);
  }
}
