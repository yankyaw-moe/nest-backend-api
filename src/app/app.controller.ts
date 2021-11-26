import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
// import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class AppController {
    constructor(private authService: AuthService){}

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    login(@Request() req): any {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    getProfile(@Request() req): any {
        return req.user;
    }
}