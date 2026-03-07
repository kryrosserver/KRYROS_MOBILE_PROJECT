import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize a payment' })
  initialize(@Body() body: any) {
    return this.paymentsService.initialize(body);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  verify(@Body('reference') reference: string) {
    return this.paymentsService.verify(reference);
  }
}
