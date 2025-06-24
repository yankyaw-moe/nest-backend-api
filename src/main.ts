import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableCors({
    // origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    origin: '*', // Allow all origins for development purposes.
    credentials: true, // allows sending cookies and authentication headers.
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes unexpected properties from request data.
      transform: true, // Converts incoming data into the correct types (e.g., string → number).
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Real-time chat API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
