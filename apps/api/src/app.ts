import { OpenAPIHandler } from '@orpc/openapi/node';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {
  IConfigService,
  ILoggerService,
  toApiErrorBody,
  TYPES,
} from '@/common';
import { IItemsController, IItemsService } from '@/modules/items';

@injectable()
export class App {
  private readonly app: express.Application;

  constructor(
    @inject(TYPES.ConfigService)
    private readonly configService: IConfigService,
    @inject(TYPES.LoggerService)
    private readonly loggerService: ILoggerService,
    @inject(TYPES.ItemsController)
    private readonly itemsController: IItemsController,
    @inject(TYPES.ItemsService)
    private readonly itemsService: IItemsService,
  ) {
    this.app = express();
  }

  public init(): express.Application {
    this.useMiddlewares();
    this.useHealthRoutes();
    this.useOrpcRoutes();
    this.useErrorHandler();

    return this.app;
  }

  public async shutdown(): Promise<void> {
    await this.itemsService.shutdown();
  }

  private useMiddlewares(): void {
    this.app.use(
      cors({
        origin:
          this.configService.get('CORS_ORIGIN') === '*'
            ? true
            : this.configService.get('CORS_ORIGIN'),
        credentials: true,
      }),
    );

    this.app.use(express.json());

    this.app.use((request, response, next) => {
      const startedAt = Date.now();

      response.on('finish', () => {
        this.loggerService.info(`${request.method} ${request.originalUrl}`, {
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });

      next();
    });
  }

  private useHealthRoutes(): void {
    this.app.get('/health', (_request, response) => {
      response.json({ status: 'ok' });
    });
  }

  private useOrpcRoutes(): void {
    const handler = new OpenAPIHandler(this.itemsController.router, {
      customErrorResponseBodyEncoder: toApiErrorBody,
    });

    this.app.use((request, response, next) => {
      void handler
        .handle(request, response, {
          prefix: '/',
        })
        .then((result) => {
          if (!result.matched) {
            next();
          }
        })
        .catch((error: unknown) => {
          next(error);
        });
    });
  }

  private useErrorHandler(): void {
    this.app.use(
      (
        error: unknown,
        _request: Request,
        response: Response,
        _next: NextFunction,
      ) => {
        this.loggerService.error(error);
        response.status(500).json({
          message: 'Internal server error',
        });
      },
    );
  }
}
