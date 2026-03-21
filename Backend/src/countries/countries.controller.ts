import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
// Assuming you have an AdminGuard and JwtAuthGuard
// import { AdminGuard } from '../auth/guards/admin.guard';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  @Post('seed')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  seed() {
    return this.countriesService.seedDefaults();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.countriesService.remove(id);
  }

  // Payment Methods Endpoints
  @Post(':countryId/payment-methods')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  addPaymentMethod(@Param('countryId') countryId: string, @Body() data: any) {
    return this.countriesService.addPaymentMethod(countryId, data);
  }

  @Patch('payment-methods/:id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  updatePaymentMethod(@Param('id') id: string, @Body() data: any) {
    return this.countriesService.updatePaymentMethod(id, data);
  }

  @Delete('payment-methods/:id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  removePaymentMethod(@Param('id') id: string) {
    return this.countriesService.removePaymentMethod(id);
  }
}
