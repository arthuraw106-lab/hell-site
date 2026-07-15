import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

type SocketUser = {
  sub: string;
  username: string;
  role: string;
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.toString().replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      }) as SocketUser;

      client.data.user = payload;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('room:join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const history = await this.chatService.messages(roomId, client.data.user.sub);
    client.join(roomId);
    client.emit('room:history', history);
    return { ok: true };
  }

  @SubscribeMessage('message:send')
  async send(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomId: string; type?: any; body?: string; mediaUrl?: string },
  ) {
    const message = await this.chatService.send(client.data.user.sub, body);
    this.server.to(body.roomId).emit('message:new', message);

    if (await this.chatService.shouldAiReply(body.body)) {
      const reply = await this.chatService.aiReply(body.roomId, body.body);
      this.server.to(body.roomId).emit('message:new', reply);
    }

    return message;
  }
}
