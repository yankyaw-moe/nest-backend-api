import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: 'supabase-managed',
    });

    const { password, ...result } = await this.usersRepository.save(user);
    return result;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findBySupabaseId(supabaseId: string) {
    return this.usersRepository.findOne({ where: { id: supabaseId } });
  }

  async updateUser(id: string, updates: Partial<User>) {
    await this.usersRepository.update(id, updates);
    return this.findById(id);
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.usersRepository.update(userId, { isOnline });
  }

  async findAll(query: any = {}): Promise<User[]> {
    return this.usersRepository.find(query);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
