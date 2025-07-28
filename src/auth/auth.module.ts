import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/shared/mail/mail.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [UsersModule, MailModule, SupabaseModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
