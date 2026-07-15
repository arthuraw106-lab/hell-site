import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  mangaId!: string;

  @IsString()
  chapterId!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;

  @IsOptional()
  @IsBoolean()
  spoiler?: boolean;
}
