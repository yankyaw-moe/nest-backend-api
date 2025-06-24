import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const authToken =
        client.handshake.headers.authorization || client.handshake.auth.token;
      console.log('authToken ', authToken);
      if (!authToken) {
        throw new WsException('Unauthorized');
      }
      const token = authToken.split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      // Store user data in socket
      client.data.user = payload;

      return true;
    } catch (error) {
      console.log('error ', error);
      throw new WsException('Unauthorized');
    }
  }
}
