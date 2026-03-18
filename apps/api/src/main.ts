import 'reflect-metadata';
import { createServer } from 'node:http';
import { App } from '@/app';
import { IConfigService, ILoggerService, TYPES } from '@/common';
import { container } from '@/inversify.config';

const app = container.get<App>(TYPES.App);
const configService = container.get<IConfigService>(TYPES.ConfigService);
const loggerService = container.get<ILoggerService>(TYPES.LoggerService);
const expressApp = app.init();
const port = configService.getNumber('PORT');

const server = createServer(expressApp);

server.listen(port, () => {
  loggerService.info('API listening.', {
    port,
  });
});

const shutdown = async (): Promise<void> => {
  loggerService.info('Shutdown signal received.');
  await app.shutdown();

  server.close(() => {
    loggerService.info('API stopped.');
    process.exit(0);
  });
};

process.once('SIGINT', () => {
  void shutdown();
});

process.once('SIGTERM', () => {
  void shutdown();
});
