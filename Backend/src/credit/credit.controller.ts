import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

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
  getPlans(@Query('productId') productId?: string) {
    return this.creditService.getPlans({ productId });
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new credit plan (Admin)' })
  createPlan(@Body() body: any) {
    return this.creditService.createPlan(body);
  }

  @Put('plans/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a credit plan (Admin)' })
  updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.creditService.updatePlan(id, body);
  }

  @Body()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a credit plan (Admin)' })
  deletePlan(@Param('id') id: string) {
    return this.creditService.deletePlan(id);
  }

  @Get('accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user credit accounts' })
  getAccounts(@Param('userId') userId: string) {
    return this.creditService.getAccounts(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all credit accounts (Admin)' })
  getAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
  ) {
    // In a real app, you should also have an AdminGuard here
    return this.creditService.getAllAccounts({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      status,
    });
  }

  @Put('accounts/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update credit account status (Admin)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.creditService.updateAccountStatus(id, body.status);
  }

  @Get('my-credits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user credit accounts' })
  getMyCredits(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.creditService.getAccounts(userId);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate installment' })
  calculate(@Body() body: { amount: number; planId: string }) {
    return this.creditService.calculateInstallment(body.amount, body.planId);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for credit' })
  apply(@Req() req: Request, @Body() body: { productId: string; planId: string; amount: number }) {
    const userId = (req as any).user.id;
    return this.creditService.applyForCredit(userId, body);
  }
}
