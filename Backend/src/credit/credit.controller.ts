import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Credit')
@Controller('credit')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user credit profile' })
  getProfile(@Param('userId') userId: string) {
    return this.creditService.getProfile(userId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available credit plans' })
  getPlans() {
    return this.creditService.getPlans();
  }

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user credit accounts' })
  getAccounts(@Param('userId') userId: string) {
    return this.creditService.getAccounts(userId);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate installment' })
  calculate(@Body() body: { amount: number; planId: string }) {
    return this.creditService.calculateInstallment(body.amount, body.planId);
  }
}
