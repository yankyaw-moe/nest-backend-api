// src/data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres', // or your preferred database
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'chat_api_nest',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
});
