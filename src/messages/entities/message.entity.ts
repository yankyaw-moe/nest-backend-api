import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  receiver: User;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ default: null })
  deliveredAt: Date;

  @Column({ default: null })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
