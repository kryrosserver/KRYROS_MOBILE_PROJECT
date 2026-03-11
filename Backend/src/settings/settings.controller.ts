import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  findAll() {
    return this.settingsService.getAll();
  }

  @Get('shipping')
  @ApiOperation({ summary: 'Get shipping configuration' })
  getShippingConfig() {
    return this.settingsService.getShippingConfig();
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a setting (Admin only)' })
  update(@Param('key') key: string, @Body('value') value: string) {
    // In a real app, you would add an AdminGuard here
    return this.settingsService.update(key, value);
  }
}
