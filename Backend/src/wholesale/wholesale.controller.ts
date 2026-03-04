import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WholesaleService } from './wholesale.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wholesale')
@Controller('wholesale')
export class WholesaleController {
  constructor(private wholesaleService: WholesaleService) {}

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
}
