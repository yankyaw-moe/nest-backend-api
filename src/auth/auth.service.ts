import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { Logger } from 'nestjs-pino';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
    private readonly logger: Logger, // Inject the Logger service from nestjs-pino
  ) {}

  // async validateUser(email: string, password: string): Promise<any> {
  //   const user = await this.usersService.findByEmail(email);
  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  async signUp(email: string, password: string, name: string) {
    const supabaseUser = await this.supabaseService.signUp(email, password, {
      name,
    });
    console.log('supabaseUser >>> ', supabaseUser);

    // Create local user record
    await this.usersService.create({
      email,
      name,
      password: 'supabase-managed', // Password is managed by Supabase
    });

    return {
      user: {
        id: supabaseUser.user?.id,
        email: supabaseUser.user?.email,
        name: supabaseUser.user?.user_metadata?.name,
      },
      accessToken: supabaseUser.session?.access_token,
      refreshToken: supabaseUser.session?.refresh_token,
    };
  }

  async signIn(email: string, password: string) {
    const supabaseUser = await this.supabaseService.signIn(email, password);

    // Get or create local user record
    let localUser = await this.usersService.findByEmail(email);
    if (!localUser) {
      await this.usersService.create({
        email,
        name: supabaseUser.user?.user_metadata?.name || email,
        password: 'supabase-managed',
      });
    }

    return {
      user: {
        id: supabaseUser.user?.id,
        email: supabaseUser.user?.email,
        name: supabaseUser.user?.user_metadata?.name,
      },
      accessToken: supabaseUser.session?.access_token,
      refreshToken: supabaseUser.session?.refresh_token,
    };
  }

  async signOut(token: string) {
    return this.supabaseService.signOut(token);
  }

  async refreshToken(refreshToken: string) {
    return this.supabaseService.refreshToken(refreshToken);
  }

  async getUser(token: string) {
    const user = await this.supabaseService.getUser(token);

    // Get local user record
    const localUser = await this.usersService.findByEmail(user?.email || '');

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      role: localUser?.role || 'user',
    };
  }
}
