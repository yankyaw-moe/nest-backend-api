import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfiguration } from 'src/config/env.config';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import useBullFactory from './config/bull/bull.factory';
import useDatabaseFactory from './config/database/database.factory';
import useLoggerFactory from './config/logger/logger.factory';
import { ListingModule } from './listing/listing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
    }),
    LoggerModule.forRootAsync({
      useFactory: useLoggerFactory,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useDatabaseFactory,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useBullFactory,
    }),
    UsersModule,
    MessagesModule,
    AuthModule,
    ListingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
