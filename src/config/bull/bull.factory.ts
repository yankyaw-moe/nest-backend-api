import { ConfigService } from '@nestjs/config';

const useBullFactory = async (configService: ConfigService) => ({
  redis: {
    host: configService.get('redis.host'),
    port: configService.get('redis.port'),
  },
});

export default useBullFactory;
