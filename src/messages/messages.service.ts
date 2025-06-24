import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesQueueService } from './messages.queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    private messagesQueueService: MessagesQueueService,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const message = this.messagesRepository.create({
      content: createMessageDto.content,
      sender: { id: senderId },
      receiver: { id: createMessageDto.receiverId },
    });
    console.log('message ', message);
    const savedMessage = await this.messagesRepository.save(message);
    // Send to RabbitMQ queue
    await this.messagesQueueService.sendMessage('new_message', savedMessage);

    return savedMessage;
  }

  async getConversation(
    userId1: string,
    userId2: string,
    options: { page: number; limit: number },
  ) {
    const skip = (options.page - 1) * options.limit;

    // return await this.messageModel
    //   .find({
    //     $or: [
    //       { sender: userId1, receiver: userId2 },
    //       { sender: userId2, receiver: userId1 },
    //     ],
    //   })
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(options.limit)
    //   .populate('sender')
    //   .populate('receiver')
    //   .exec();
    return this.messagesRepository.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: options.limit,
      relations: ['sender', 'receiver'],
    });
  }

  async markAsRead(messageId: string) {
    // const message = await this.messageModel
    //   .findByIdAndUpdate(
    //     messageId,
    //     {
    //       isRead: true,
    //       readAt: new Date(),
    //     },
    //     { new: true },
    //   )
    //   .populate('sender')
    //   .populate('receiver')
    //   .exec();

    // if (!message) {
    //   throw new NotFoundException('Message not found');
    // }

    // return message;
    await this.messagesRepository.update(messageId, { isRead: true });
    // return this.messagesRepository.findOne({ where: { id: messageId } });
  }

  async trackMessageDelivery(messageId: string) {
    // Simulate tracking logic
    // For example, send a message to a RabbitMQ queue to track delivery
    await this.messagesQueueService.sendMessage('track_delivery', {
      messageId,
      timestamp: new Date(),
    });
  }

  async sendReadReceipt(messageId: string, userId: string) {
    // Send a message to a RabbitMQ queue to notify the receiver
    await this.messagesQueueService.sendMessage('read_receipt', {
      messageId,
      userId,
      timestamp: new Date(),
    });
  }

  async getUnreadMessages(userId: string) {
    // return await this.messageModel
    //   .find({
    //     receiver: new Types.ObjectId(userId),
    //     isRead: false,
    //   })
    //   .sort({ createdAt: -1 })
    //   .populate('sender')
    //   .exec();
    return this.messagesRepository.find({
      where: { receiver: { id: userId }, isRead: false },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
  }

  async markAsDelivered(messageId: string) {
    // const message = await this.messageModel
    //   .findByIdAndUpdate(
    //     messageId,
    //     {
    //       isDelivered: true,
    //       deliveredAt: new Date(),
    //     },
    //     { new: true },
    //   )
    //   .exec();

    // if (!message) {
    //   throw new NotFoundException('Message not found');
    // }
    // return message;
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.isDelivered = true;
    message.deliveredAt = new Date();
    await this.messagesRepository.save(message);

    await this.messagesQueueService.sendMessage('delivery_confirmation', {
      messageId,
      timestamp: new Date(),
    });
    return message;
  }
}
