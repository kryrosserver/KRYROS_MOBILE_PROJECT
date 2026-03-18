import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateCityDto {
  @IsUUID()
  stateId: string;

  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
