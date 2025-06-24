import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private usersService: UsersService,
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  // @UseGuards(WsJwtGuard)
  async handleConnection(client: Socket) {
    try {
      const authToken =
        client.handshake.headers.authorization || client.handshake.auth.token;
      if (!authToken) {
        client.disconnect();
        return;
      }
      const token = authToken.split(' ')[1];
      console.log('token ', token);
      const payload = this.jwtService.verify(token);
      console.log('payload ', payload);
      client.data.user = payload;
      const userId = payload.sub;
      await this.usersService.updateOnlineStatus(userId, true);
      client.join(userId);
      this.server.emit('userStatus', { userId, isOnline: true });
    } catch (error) {
      console.log('error ', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log('handleDisconnect user ', client.data?.user);
    const userId = client.data?.user?.sub;
    if (userId) {
      await this.usersService.updateOnlineStatus(userId, false);
      // client.leave(userId);
      this.server.emit('userStatus', { userId, isOnline: false });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    const message = await this.messagesService.create(
      client.data.user.sub,
      payload,
    );
    // this.server.to(payload.receiverId).emit('newMessage', message);
    console.log('handleMessage ', message);
    return message;
  }
}
