import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum SymbolPosition {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateCountryDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  currencyCode: string;

  @IsString()
  currencySymbol: string;

  @IsEnum(SymbolPosition)
  @IsOptional()
  symbolPosition?: SymbolPosition;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsBoolean()
  @IsOptional()
  autoRate?: boolean;

  @IsString()
  @IsOptional()
  flag?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentMethodDto)
  paymentMethods?: CreatePaymentMethodDto[];
}
