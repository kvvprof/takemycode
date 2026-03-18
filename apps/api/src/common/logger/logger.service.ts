import { injectable } from 'inversify';
import pino from 'pino';
import { ILoggerService } from '@/common/logger/logger.service.interface';

@injectable()
export class LoggerService implements ILoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'takemycode-api',
    },
  });

  public info(message: string, payload?: unknown): void {
    if (payload === undefined) {
      this.logger.info(message);
      return;
    }

    this.logger.info(payload, message);
  }

  public error(error: unknown, payload?: unknown): void {
    if (error instanceof Error) {
      this.logger.error(
        {
          err: error,
          payload,
        },
        error.message,
      );
      return;
    }

    this.logger.error(
      {
        payload,
      },
      typeof error === 'string' ? error : 'Unknown error',
    );
  }
}
