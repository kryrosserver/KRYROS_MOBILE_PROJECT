import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a setting (Admin only)' })
  update(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.update(key, value);
  }
}
