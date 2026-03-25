import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateFooterLinkDto {
  @IsString()
  sectionId: string;

  @IsString()
  label: string;

  @IsString()
  href: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
