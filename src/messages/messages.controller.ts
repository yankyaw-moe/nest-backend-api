import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('messages')
@UseGuards(JwtGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @User('id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messagesService.create(userId, createMessageDto);
    // Queue message for delivery tracking
    await this.messagesService.trackMessageDelivery(message.id);
    return message;
  }

  @Get('conversation/:userId')
  getConversation(
    @User('id') currentUserId: string,
    @Param('userId') otherUserId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messagesService.getConversation(currentUserId, otherUserId, {
      page,
      limit,
    });
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @User('id') userId: string) {
    const message = await this.messagesService.markAsRead(id);
    // Queue read receipt
    await this.messagesService.sendReadReceipt(id, userId);
    return message;
  }

  @Get('unread')
  getUnreadMessages(@User('id') userId: string) {
    return this.messagesService.getUnreadMessages(userId);
  }

  @Post(':id/delivered')
  async markAsDelivered(@Param('id') id: string) {
    return this.messagesService.markAsDelivered(id);
  }
}
