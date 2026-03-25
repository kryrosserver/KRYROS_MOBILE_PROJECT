import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query('status') status?: string, @Query('skip') skip?: number, @Query('take') take?: number) {
    return this.ordersService.findAll(undefined, { status, skip: skip ? Number(skip) : undefined, take: take ? Number(take) : undefined });
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
  @ApiOperation({ summary: 'Track order by ID and email (Public)' })
  async trackOrder(@Query('orderNumber') orderNumber: string, @Query('email') email: string) {
    return this.ordersService.trackOrder(orderNumber, email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order (Public/Guest support)' })
  create(@Req() req: Request, @Body() data: CreateOrderDto) {
    // req.user will be populated if a valid token is provided, otherwise it's a guest order
    const userId = (req as any).user?.id;
    return this.ordersService.create(userId, data);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('paymentStatus') paymentStatus?: string) {
    return this.ordersService.updateStatus(id, status, paymentStatus);
  }
}
