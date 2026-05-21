import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorEnableDto {
  @ApiProperty({ description: '6-digit TOTP code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
  code: string;
}

export class TwoFactorValidateDto {
  @ApiProperty({ description: 'Short-lived 2FA pending token returned by login' })
  @IsString()
  twoFactorToken: string;

  @ApiProperty({ description: '6-digit TOTP code from authenticator app' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
  code: string;
}
