import { Container } from 'inversify';
import { App } from '@/app';
import {
  ConfigService,
  IConfigService,
  ILoggerService,
  LoggerService,
  TYPES,
} from '@/common';
import {
  IItemsController,
  IItemsQueueService,
  IItemsRepository,
  IItemsService,
  ItemsController,
  ItemsQueueService,
  ItemsRepository,
  ItemsService,
} from '@/modules/items';

const container = new Container();

container.bind<App>(TYPES.App).to(App).inSingletonScope();
container
  .bind<IConfigService>(TYPES.ConfigService)
  .to(ConfigService)
  .inSingletonScope();
container
  .bind<ILoggerService>(TYPES.LoggerService)
  .to(LoggerService)
  .inSingletonScope();

container
  .bind<IItemsRepository>(TYPES.ItemsRepository)
  .to(ItemsRepository)
  .inSingletonScope();
container
  .bind<IItemsQueueService>(TYPES.ItemsQueueService)
  .to(ItemsQueueService)
  .inSingletonScope();
container
  .bind<IItemsService>(TYPES.ItemsService)
  .to(ItemsService)
  .inSingletonScope();
container
  .bind<IItemsController>(TYPES.ItemsController)
  .to(ItemsController)
  .inSingletonScope();

export { container };
