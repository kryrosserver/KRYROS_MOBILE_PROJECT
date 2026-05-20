import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject, IsDateString } from 'class-validator';

export enum NotificationTargetType {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
  STATUS_BASED = 'STATUS_BASED',
}

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(NotificationTargetType)
  @IsNotEmpty()
  targetType: NotificationTargetType;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  orderIds?: string[];

  @IsString()
  @IsOptional()
  orderStatus?: string;

  @IsObject()
  @IsOptional()
  data?: any;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
