import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookServiceDto {
  @ApiProperty({ example: 'uuid-of-service' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  scheduledDate!: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  scheduledTime!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
