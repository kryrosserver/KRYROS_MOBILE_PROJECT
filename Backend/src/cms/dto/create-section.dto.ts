import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  type: string; // e.g., 'testimonials'

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  // config will be sent as JSON in body; let ValidationPipe transform it
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
