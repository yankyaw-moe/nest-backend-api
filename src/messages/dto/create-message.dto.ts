import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'Message content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Receiver user ID',
  })
  @IsUUID()
  receiverId: string;
}
