import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateFooterSectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
