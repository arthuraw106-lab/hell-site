import { Role, TeamRequestStatus, TicketStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;
}

export class UpdateTeamRequestDto {
  @IsEnum(TeamRequestStatus)
  status!: TeamRequestStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTicketAdminDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
