import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WholesaleService } from './wholesale.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wholesale')
@Controller('wholesale')
export class WholesaleController {
  constructor(private wholesaleService: WholesaleService) {}

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all wholesale accounts (Admin)' })
  findAllAccounts() {
    return this.wholesaleService.findAllAccounts();
  }

  @Put('accounts/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update wholesale account status (Admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('notes') notes?: string) {
    return this.wholesaleService.updateAccountStatus(id, status, notes);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAccount(@Param('userId') userId: string) {
    return this.wholesaleService.getAccount(userId);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  apply(@Body() data: any) {
    return this.wholesaleService.apply(data);
  }

  @Post('prices/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set tiered wholesale prices for a product (Admin)' })
  setPrices(@Param('productId') productId: string, @Body() prices: any[]) {
    return this.wholesaleService.setProductWholesalePrices(productId, prices);
  }

  @Get('prices/:productId')
  @ApiOperation({ summary: 'Get tiered wholesale prices for a product' })
  getPrices(@Param('productId') productId: string) {
    return this.wholesaleService.getProductWholesalePrices(productId);
  }
}
