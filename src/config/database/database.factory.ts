import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const useDatabaseFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get('database.host', { infer: true }),
  port: configService.get('database.port', { infer: true }),
  username: configService.get('database.username', { infer: true }),
  password: configService.get('database.password', { infer: true }),
  database: configService.get('database.name', { infer: true }),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV', { infer: true }) !== 'production',
});

export default useDatabaseFactory;
