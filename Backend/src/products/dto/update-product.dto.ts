import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  brandSlug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCredit?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditMinimum?: number;

  @IsOptional()
  @IsBoolean()
  replaceImages?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateIf((o) => Array.isArray(o.imageDataUrls))
  imageDataUrls?: string[];
}
