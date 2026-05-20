import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    return this.newsletterService.subscribe(email);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async list() {
    return this.newsletterService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async active() {
    return this.newsletterService.findActive();
  }
}
