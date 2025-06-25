import { ConfigService } from '@nestjs/config';

const useJwtFactory = (configService: ConfigService) => ({
  secret: configService.get('jwt.secret'),
  signOptions: { expiresIn: configService.get('jwt.expiresIn') },
});

export default useJwtFactory;
