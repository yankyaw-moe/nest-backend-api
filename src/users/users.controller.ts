import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@User() user: any) {
    return user;
  }

  @Get()
  async getAllUsers(@User('id') currentUserId: string) {
    const users = await this.usersService.findAll();
    return users.filter((user) => user.id !== currentUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
