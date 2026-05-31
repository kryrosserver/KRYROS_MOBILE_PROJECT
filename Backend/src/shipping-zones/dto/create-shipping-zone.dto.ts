import { IsString, IsBoolean, IsOptional, IsInt, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShippingZoneDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  countryId?: string;

  @IsUUID()
  @IsOptional()
  stateId?: string;

  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  shippingMethod?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
