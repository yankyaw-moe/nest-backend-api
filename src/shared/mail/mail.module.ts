import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import useMailFactory from 'src/config/mail/mail.factory';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: useMailFactory,
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
