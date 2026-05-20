import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping-method.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Shipping Methods')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shipping method (Admin only)' })
  async create(@Body() dto: CreateShippingMethodDto) {
    try {
      return await this.shippingService.create(dto);
    } catch (error) {
      console.error('Error in ShippingController.create:', error);
      // Return a 500 with more detail to help debugging
      throw new InternalServerErrorException({
        message: 'Failed to create shipping method',
        error: error.message,
        details: error.toString()
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping methods' })
  findAll() {
    return this.shippingService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get only active shipping methods' })
  findActive() {
    return this.shippingService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shipping method by ID' })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shipping method (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    try {
      return await this.shippingService.update(id, dto);
    } catch (error) {
      console.error('Error in ShippingController.update:', error);
      throw new InternalServerErrorException({
        message: 'Failed to update shipping method',
        error: error.message,
        details: error.toString()
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shipping method (Admin only)' })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}
