import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  text?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
