import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagesConsumer {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
  ) {}

  async handleNewMessage(data: any) {
    try {
      console.log('Processing new message: ', data);

      // Emit the message to the recipient via WebSocket
      this.server.to(data.data.receiver.id).emit('newMessage', data);
      return true;
    } catch (error) {
      console.error('Error processing new message: ', error);
      throw error;
    }
  }

  async handleTrackDelivery(data: any) {
    try {
      console.log('Tracking message delivery: ', data);
      const { messageId, timestamp } = data;

      // Update message delivery status
      this.messagesRepository.update(
        { id: messageId },
        { isDelivered: true, deliveredAt: timestamp },
      );

      // Get the updated message with relations
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'receiver'],
      });

      // Notify sender about delivery
      if (message) {
        this.server.to(message.sender.id).emit('messageDelivered', {
          messageId,
          deliveredAt: timestamp,
        });
      }

      return true;
    } catch (error) {
      console.error('Error tracking message delivery: ', error);
      throw error;
    }
  }

  async handleReadReceipt(data: any) {
    try {
      console.log('Processing read receipt: ', data);
      const { messageId, userId, timestamp } = data;

      // Update message read status
      await this.messagesRepository.update(
        { id: messageId },
        { isRead: true, readAt: timestamp },
      );

      // Get the message with relations
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['sender'],
      });

      // Notify sender that message was read
      if (message) {
        this.server.to(message.sender.id).emit('messageRead', {
          messageId,
          readAt: timestamp,
        });
      }

      return true;
    } catch (error) {
      console.error('Error processing read receipt: ', error);
      throw error;
    }
  }

  async handleDeliveryConfirmation(data: any) {
    try {
      console.log('Processing delivery confirmation: ', data);
      const { messageId, timestamp } = data;

      // Get the message with relations
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'receiver'],
      });

      // Notify both sender and receiver about delivery
      if (message) {
        this.server.to(message.sender.id).emit('messageDeliveryStatus', {
          messageId,
          status: 'delivered',
          timestamp,
        });
      }

      return true;
    } catch (error) {
      console.error('Error processing delivery confirmation: ', error);
      throw error;
    }
  }
}
