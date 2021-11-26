import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@Controller()
export class AppController {

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    login(@Request() req): any {
        return {msg: 'Logged in!'};
    }

    @UseGuards(AuthenticatedGuard)
    @Get('/protected')
    getHello(@Request() req): any {
        return req.user;
    }
}