import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a payment' })
  initialize(@Body() body: any) {
    return { status: 'initialized', ...body };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  verify(@Body('reference') reference: string) {
    return { status: 'verified', reference };
  }

  @Get('status/:orderId')
  @ApiOperation({ summary: 'Check payment status' })
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.checkStatus(orderId);
  }
}
