import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateFooterLinkDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
