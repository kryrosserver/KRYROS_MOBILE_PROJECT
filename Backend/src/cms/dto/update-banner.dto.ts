import { IsBoolean, IsInt, IsOptional, IsString, Min, IsISO8601 } from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  mediaType?: string; // "image" or "video"

  @IsOptional()
  @IsString()
  image?: string;

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
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number; // Duration in seconds for video banners

  @IsOptional()
  @IsInt()
  @Min(1)
  displayDays?: number; // How many days to display this banner

  @IsOptional()
  @IsISO8601()
  startDate?: string | null;

  @IsOptional()
  @IsISO8601()
  endDate?: string | null;
}
