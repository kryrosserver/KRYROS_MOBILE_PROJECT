import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateStateDto {
  @IsUUID()
  countryId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
