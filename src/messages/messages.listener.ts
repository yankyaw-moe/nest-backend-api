import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { MessagesConsumer } from './messages.consumer';

@Injectable()
export class MessagesListener implements OnModuleInit {
  private connection: any;
  private channel: amqp.Channel;

  constructor(
    private configService: ConfigService,
    private messagesConsumer: MessagesConsumer,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.setupConsumers();
  }

  private async connect() {
    try {
      const url = this.configService.get('rabbitmq.host');
      this.connection = await amqp.connect(url as string);
      this.channel = await this.connection.createChannel();

      // Setup queues
      const queueName = this.configService.get<string>('rabbitmq.queue');
      await this.channel.assertQueue(queueName as string, { durable: true });

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupConsumers() {
    const queueName = this.configService.get<string>('rabbitmq.queue');
    this.channel.consume(queueName as string, async (message) => {
      if (message) {
        try {
          const content = JSON.parse(message.content.toString());
          console.log('Received message:', content);

          const pattern =
            message.properties.headers?.pattern ||
            content?.pattern ||
            'unknown';
          console.log(`Received message with pattern: ${pattern}`);

          switch (pattern) {
            case 'new_message':
              await this.messagesConsumer.handleNewMessage(content);
              break;
            case 'track_delivery':
              await this.messagesConsumer.handleTrackDelivery(content);
              break;
            case 'read_receipt':
              await this.messagesConsumer.handleReadReceipt(content);
              break;
            case 'delivery_confirmation':
              await this.messagesConsumer.handleDeliveryConfirmation(content);
              break;
            default:
              console.warn(`Unknown message pattern: ${pattern}`);
          }

          // Acknowledge the message
          this.channel.ack(message);
          console.log('Message acknowledged');
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and requeue
          this.channel.nack(message, false, true);
          console.log('Message rejected and requeued');
        }
      }
    });
  }
}
