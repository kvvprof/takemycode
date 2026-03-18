import { DotenvParseOutput, config } from 'dotenv';
import { inject, injectable } from 'inversify';
import {
  AppConfigKey,
  IConfigService,
} from '@/common/config/config.service.interface';
import { TYPES } from '@/common/constants';
import { ILoggerService } from '@/common/logger';

@injectable()
export class ConfigService implements IConfigService {
  private readonly config: DotenvParseOutput;

  constructor(
    @inject(TYPES.LoggerService) private readonly loggerService: ILoggerService,
  ) {
    const envFile = '.env';

    const { error, parsed } = config({ path: envFile });

    if (error) {
      this.loggerService.error(`File ${envFile} not found.`);
    }

    if (!parsed) {
      this.loggerService.error(`File ${envFile} is empty.`);
    }

    this.config = (parsed ?? {}) as DotenvParseOutput;

    this.loggerService.info('Env config loaded.', {
      envFile,
    });
  }

  public get(key: AppConfigKey): string {
    const value = this.config[key] ?? process.env[key];

    if (!value) {
      this.loggerService.error(`${key} not found.`);
      return '';
    }

    return value;
  }

  public getNumber(key: AppConfigKey): number {
    const rawValue = this.get(key);
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      throw new Error(`Config key ${key} is not a number`);
    }

    return parsedValue;
  }
}
