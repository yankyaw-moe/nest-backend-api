import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { MessagesQueueService } from './messages.queue.service';
import { MessagesConsumer } from './messages.consumer';
import { MessagesListener } from './messages.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ConfigModule,
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesGateway,
    WsJwtGuard,
    MessagesQueueService,
    MessagesConsumer,
    MessagesListener,
  ],
})
export class MessagesModule {}
