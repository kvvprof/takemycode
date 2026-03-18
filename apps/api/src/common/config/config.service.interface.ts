export type AppConfigKey = 'PORT' | 'CORS_ORIGIN' | 'ENV' | 'LOG_LEVEL';

export interface IConfigService {
  get(key: AppConfigKey): string;
  getNumber(key: AppConfigKey): number;
}
