import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WholesaleService } from './wholesale.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ApplyWholesaleDto } from './dto/apply-wholesale.dto';

@ApiTags('Wholesale')
@Controller('wholesale')
export class WholesaleController {
  constructor(private wholesaleService: WholesaleService) {}

  @Get('accounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all wholesale accounts (Admin only)' })
  findAllAccounts() {
    return this.wholesaleService.findAllAccounts();
  }

  @Put('accounts/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject wholesale account (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.wholesaleService.updateAccountStatus(id, status, notes);
  }

  @Get('my-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user wholesale account' })
  getMyAccount(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.wholesaleService.getAccount(userId);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wholesale account by user ID (Admin only)' })
  getAccount(@Param('userId') userId: string) {
    return this.wholesaleService.getAccount(userId);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a wholesale account' })
  apply(@Req() req: Request, @Body() body: ApplyWholesaleDto) {
    return this.wholesaleService.apply({ ...body, userId: (req as any).user.id });
  }

  @Post('prices/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set tiered wholesale prices for a product (Admin only)' })
  setPrices(
    @Param('productId') productId: string,
    @Body() prices: { minQuantity: number; price: number; accountId?: string }[],
  ) {
    return this.wholesaleService.setProductWholesalePrices(productId, prices);
  }

  @Get('prices/:productId')
  @ApiOperation({ summary: 'Get tiered wholesale prices for a product (Public)' })
  getPrices(@Param('productId') productId: string) {
    return this.wholesaleService.getProductWholesalePrices(productId);
  }
}
