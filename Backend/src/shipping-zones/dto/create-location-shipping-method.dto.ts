import { IsString, IsBoolean, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateLocationShippingMethodDto {
  @IsUUID()
  zoneId: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  freeShippingThreshold?: number;

  @IsString()
  @IsOptional()
  estimatedDays?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
