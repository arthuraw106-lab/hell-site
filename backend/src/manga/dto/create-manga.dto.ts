import { MangaStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMangaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  altTitle?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  slug!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsEnum(MangaStatus)
  status?: MangaStatus;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}
