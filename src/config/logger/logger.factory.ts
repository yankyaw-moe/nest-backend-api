import { Params } from 'nestjs-pino';

const useLoggerFactory = async (): Promise<Params> => ({
  pinoHttp: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard', // Format the timestamp.
        ignore: 'pid,hostname', // Ignore these fields from the log output.
        singleLine: true,
      },
    },
  },
});

export default useLoggerFactory;
