import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto, UpdateRoomDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  rooms(@CurrentUser() user: RequestUser) {
    return this.chatService.myRooms(user.sub);
  }

  @Post('rooms')
  createRoom(@CurrentUser() user: RequestUser, @Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(user.sub, dto, user.role);
  }

  @Patch('rooms/:id')
  updateRoom(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.chatService.updateRoom(id, dto, user.sub, user.role);
  }

  @Get('rooms/:id/messages')
  messages(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.chatService.messages(id, user.sub);
  }

  @Post('messages')
  async send(@CurrentUser() user: RequestUser, @Body() dto: SendMessageDto) {
    const message = await this.chatService.send(user.sub, dto);

    // Trigger AI reply if the message mentions @ai / regis / ربات
    if (await this.chatService.shouldAiReply(dto.body)) {
      const reply = await this.chatService.aiReply(dto.roomId, dto.body);
      return { message, aiReply: reply };
    }

    return message;
  }

  @Get('users/:id')
  userProfile(@Param('id') id: string) {
    return this.chatService.userProfile(id);
  }
}
