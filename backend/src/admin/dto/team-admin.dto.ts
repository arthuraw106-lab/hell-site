import { TeamRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamTestFileDto {
  @IsEnum(TeamRole)
  role!: TeamRole;

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @MaxLength(500)
  fileUrl!: string;
}

export class UpdateTeamTestFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;
}

export class TeamReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
