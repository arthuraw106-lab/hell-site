import { ChatRoomType, MessageType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsEnum(ChatRoomType)
  type!: ChatRoomType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsArray()
  @IsString({ each: true })
  memberIds!: string[];
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class SendMessageDto {
  @IsString()
  roomId!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
