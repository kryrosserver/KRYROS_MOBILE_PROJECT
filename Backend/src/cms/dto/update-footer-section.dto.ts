import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateFooterSectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
