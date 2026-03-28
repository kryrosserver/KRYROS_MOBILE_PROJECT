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

  // Newsletter Popup Config
  @IsOptional()
  @IsString()
  newsletterPopupEnabled?: boolean;

  @IsOptional()
  @IsString()
  newsletterPopupTitle?: string;

  @IsOptional()
  @IsString()
  newsletterPopupSubtitle?: string;

  @IsOptional()
  @IsString()
  newsletterPopupImage?: string;

  @IsOptional()
  newsletterPopupDelay?: number;

  // Announcement Bar Config
  @IsOptional()
  @IsString()
  announcementBarEnabled?: boolean;

  @IsOptional()
  @IsString()
  announcementBarText?: string;

  @IsOptional()
  @IsString()
  announcementBarLink?: string;

  @IsOptional()
  @IsString()
  announcementBarBgColor?: string;

  @IsOptional()
  @IsString()
  announcementBarTextColor?: string;
}
