export const TYPES = {
  App: Symbol.for('App'),
  ConfigService: Symbol.for('ConfigService'),
  LoggerService: Symbol.for('LoggerService'),
  ItemsRepository: Symbol.for('ItemsRepository'),
  ItemsQueueService: Symbol.for('ItemsQueueService'),
  ItemsService: Symbol.for('ItemsService'),
  ItemsController: Symbol.for('ItemsController'),
} as const;
