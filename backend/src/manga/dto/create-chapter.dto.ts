import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateChapterDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  number!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  title!: string;

  @IsArray()
  @IsString({ each: true })
  pages!: string[];

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  zipUrl?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
