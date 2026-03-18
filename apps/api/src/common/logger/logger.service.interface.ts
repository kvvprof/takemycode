export interface ILoggerService {
  info(message: string, payload?: unknown): void;
  error(error: unknown, payload?: unknown): void;
}
