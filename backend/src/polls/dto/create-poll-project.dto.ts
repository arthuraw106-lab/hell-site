import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePollProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(5)
  description!: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
