import { BullRootModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

const useBullFactory = async (
  configService: ConfigService,
): Promise<BullRootModuleOptions> => ({
  redis: {
    host: configService.get('redis.host'),
    port: configService.get('redis.port'),
  },
});

export default useBullFactory;
