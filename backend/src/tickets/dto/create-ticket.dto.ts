import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  subject!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  body!: string;
}

export class ReplyTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}
