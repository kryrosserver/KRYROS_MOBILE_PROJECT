import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsUUID()
  @IsOptional()
  variantId?: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}

export class AddressDetailsDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsUUID()
  @IsOptional()
  countryId?: string | null;

  @IsUUID()
  @ValidateIf((o) => !o.manual)
  @IsOptional()
  stateId?: string | null;

  @IsUUID()
  @ValidateIf((o) => !o.manual)
  @IsOptional()
  cityId?: string | null;

  @IsString()
  @IsOptional()
  stateName?: string;

  @IsString()
  @IsOptional()
  cityName?: string;

  @IsString()
  @IsOptional()
  countryName?: string;

  @IsBoolean()
  @IsOptional()
  manual?: boolean;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsUUID()
  @IsOptional()
  shippingAddressId?: string;

  @IsUUID()
  @IsOptional()
  billingAddressId?: string;

  @IsUUID()
  @IsOptional()
  shippingMethodId?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  paymentPhone?: string;

  @IsOptional()
  totalZMW?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDetailsDto)
  addressDetails?: AddressDetailsDto;
}
