import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePollProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cover?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePollProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cover?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
