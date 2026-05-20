import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/ban-types
  config?: object;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
