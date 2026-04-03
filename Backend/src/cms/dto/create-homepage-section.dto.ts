import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateHomePageSectionDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  linkText?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/ban-types
  config?: object;

  @IsOptional()
  @IsString()
  animation?: string;
}
