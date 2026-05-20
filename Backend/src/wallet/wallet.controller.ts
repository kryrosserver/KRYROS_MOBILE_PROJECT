import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('manage')
  @ApiOperation({ summary: 'Admin: List wallets' })
  getWallets() {
    return this.walletService.listWallets();
  }

  @Get('manage/transactions')
  @ApiOperation({ summary: 'Admin: List recent transactions' })
  getAllTransactions() {
    return this.walletService.listTransactions();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user wallet' })
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  getMyBalance(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.walletService.getWallet(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get current user wallet transactions' })
  async getMyTransactions(@Req() req: Request) {
    const userId = (req as any).user.id;
    const wallet = await this.walletService.getWallet(userId);
    return this.walletService.getTransactions(wallet.id);
  }

  @Get(':walletId/transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  getTransactions(@Param('walletId') walletId: string) {
    return this.walletService.getTransactions(walletId);
  }
}
