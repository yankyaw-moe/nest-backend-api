import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'nestjs-pino';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: this.configService.get<string>(
          'supabase.emailRedirectTo',
        ),
      },
    });

    if (error) {
      this.logger.error('Supabase sign up error:', error);
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error('Supabase sign in error:', error);
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async signOut(token: string) {
    const { error } = await this.supabase.auth.signOut({
      scope: 'global',
    });

    if (error) {
      this.logger.error('Supabase sign out error:', error);
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Signed out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      this.logger.error('Supabase refresh token error:', error);
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error) {
      this.logger.error('Supabase get user error:', error);
      throw new UnauthorizedException(error.message);
    }

    return data.user;
  }

  async updateUser(token: string, attributes: any) {
    const { data, error } = await this.supabase.auth.updateUser({
      ...attributes,
    });

    if (error) {
      this.logger.error('Supabase update user error:', error);
      throw new UnauthorizedException(error.message);
    }

    return data.user;
  }

  getSupabaseClient() {
    return this.supabase;
  }
}
