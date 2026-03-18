import { IsString, IsBoolean, IsOptional, IsInt, IsUUID } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
