import { TeamRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeamRequestDto {
  @IsEnum(TeamRole)
  requestedRole!: TeamRole;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sampleUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  testFileUrl?: string;
}

export class SubmitTeamProfileDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  phone!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  telegramId!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(32)
  cardNumber!: string;
}
