import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The password reset token received from forgot-password' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ description: 'The new password (minimum 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
