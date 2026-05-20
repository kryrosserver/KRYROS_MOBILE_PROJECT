import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ShippingZonesService } from './shipping-zones.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateLocationShippingMethodDto } from './dto/create-location-shipping-method.dto';

@Controller('shipping-zones')
export class ShippingZonesController {
  constructor(private readonly shippingZonesService: ShippingZonesService) {}

  @Post()
  create(@Body() createShippingZoneDto: CreateShippingZoneDto) {
    return this.shippingZonesService.create(createShippingZoneDto);
  }

  @Get()
  findAll() {
    return this.shippingZonesService.findAll();
  }

  @Get('status')
  getStatus() {
    return this.shippingZonesService.isEnabled();
  }

  @Post('toggle')
  toggle(@Body('enabled') enabled: boolean) {
    return this.shippingZonesService.toggleFeature(enabled);
  }

  @Get('matching')
  findMatching(
    @Query('countryId') countryId?: string,
    @Query('stateId') stateId?: string,
    @Query('cityId') cityId?: string,
    @Query('manual') manual?: string,
    @Query('stateName') stateName?: string,
    @Query('cityName') cityName?: string,
  ) {
    return this.shippingZonesService.findMatchingMethods(
      countryId, 
      stateId, 
      cityId, 
      manual === 'true', 
      stateName, 
      cityName
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingZonesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingZoneDto: UpdateShippingZoneDto) {
    return this.shippingZonesService.update(id, updateShippingZoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingZonesService.remove(id);
  }

  // Shipping Methods
  @Post('methods')
  addMethod(@Body() dto: CreateLocationShippingMethodDto) {
    return this.shippingZonesService.addMethod(dto);
  }

  @Patch('methods/:id')
  updateMethod(@Param('id') id: string, @Body() data: any) {
    return this.shippingZonesService.updateMethod(id, data);
  }

  @Delete('methods/:id')
  removeMethod(@Param('id') id: string) {
    return this.shippingZonesService.removeMethod(id);
  }
}
