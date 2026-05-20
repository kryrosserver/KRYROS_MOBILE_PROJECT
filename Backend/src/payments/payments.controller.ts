import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a payment' })
  initialize(@Body() body: any) {
    // This was a placeholder, we'll keep it for compatibility if needed
    return { status: 'initialized', ...body };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  verify(@Body('reference') reference: string) {
    // This was a placeholder
    return { status: 'verified', reference };
  }

  @Get('status/:orderId')
  @ApiOperation({ summary: 'Check payment status' })
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.checkStatus(orderId);
  }
}
