import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com or +260...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(({ value }) => value?.trim())
  identifier!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  // Note: intentionally NOT trimmed — passwords may contain intentional leading/trailing spaces
  password!: string;
}
