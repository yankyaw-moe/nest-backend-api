import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const useDatabaseFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get('DB_HOST', { infer: true }),
  port: configService.get('DB_PORT', { infer: true }),
  username: configService.get('DB_USERNAME', { infer: true }),
  password: configService.get('DB_PASSWORD', { infer: true }),
  database: configService.get('DB_NAME', { infer: true }),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV', { infer: true }) !== 'production',
});

export default useDatabaseFactory;
