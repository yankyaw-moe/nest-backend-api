import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  providers: [AuthService, LocalStrategy, SessionSerializer],
  imports: [UsersModule, PassportModule.register({session:true})]
})
export class AuthModule { }
