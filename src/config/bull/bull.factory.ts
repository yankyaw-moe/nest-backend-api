import { BullRootModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

const useBullFactory = async (
  configService: ConfigService,
): Promise<BullRootModuleOptions> => ({
  redis: {
    host: configService.get('redis.host', { infer: true }),
    port: configService.get('redis.port', { infer: true }),
  },
});

export default useBullFactory;
