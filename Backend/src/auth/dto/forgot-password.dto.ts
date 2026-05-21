import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address or phone number of the account' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}
