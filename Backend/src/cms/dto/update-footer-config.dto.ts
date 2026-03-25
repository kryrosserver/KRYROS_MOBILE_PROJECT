import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateFooterConfigDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactAddress?: string;

  @IsOptional()
  @IsString()
  newsletterTitle?: string;

  @IsOptional()
  @IsString()
  newsletterSubtitle?: string;

  @IsOptional()
  @IsString()
  copyrightText?: string;

  @IsOptional()
  socialLinks?: any[];

  @IsOptional()
  paymentMethods?: any[];
}
