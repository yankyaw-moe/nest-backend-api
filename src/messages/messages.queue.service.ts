import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class MessagesQueueService {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('rabbitmq.host')],
        queue: this.configService.get('rabbitmq.queue'),
        queueOptions: this.configService.get('rabbitmq.queueOptions'),
      },
    });
  }

  async sendMessage(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }
}
