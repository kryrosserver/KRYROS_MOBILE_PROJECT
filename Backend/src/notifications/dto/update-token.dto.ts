import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  platform?: string;
}
