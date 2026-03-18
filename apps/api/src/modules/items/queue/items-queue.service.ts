import Bottleneck from 'bottleneck';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/common';
import { ILoggerService } from '@/common/logger/logger.service.interface';
import { IItemsQueueService } from '@/modules/items/queue/items-queue.service.interface';
import { IItemsRepository } from '@/modules/items/repository/items.repository.interface';
import {
  AddOperation,
  AddResult,
  ReadWriteOperation,
  ReadWriteResult,
} from '@/modules/items/types/items-operation.type';

type PendingOperation<TPayload, TResult> = {
  payload: TPayload;
  resolvers: Array<(result: TResult) => void>;
  rejecters: Array<(error: unknown) => void>;
};

@injectable()
export class ItemsQueueService implements IItemsQueueService {
  private readonly addBatcher = new Bottleneck.Batcher({
    maxTime: 10_000,
  });

  private readonly readWriteBatcher = new Bottleneck.Batcher({
    maxTime: 1_000,
  });

  private readonly addPending = new Map<
    string,
    PendingOperation<AddOperation, AddResult>
  >();
  private readonly readWritePending = new Map<
    string,
    PendingOperation<ReadWriteOperation, ReadWriteResult>
  >();

  constructor(
    @inject(TYPES.ItemsRepository)
    private readonly itemsRepository: IItemsRepository,
    @inject(TYPES.LoggerService)
    private readonly loggerService: ILoggerService,
  ) {
    this.addBatcher.on('batch', (keys: string[]) => {
      void this.flushAddBatch(keys);
    });

    this.readWriteBatcher.on('batch', (keys: string[]) => {
      void this.flushReadWriteBatch(keys);
    });

    this.addBatcher.on('error', (error: unknown) => {
      this.loggerService.error(error, { queue: 'add' });
    });

    this.readWriteBatcher.on('error', (error: unknown) => {
      this.loggerService.error(error, { queue: 'read-write' });
    });
  }

  public enqueueAdd(operation: AddOperation): Promise<AddResult> {
    return this.enqueue({
      key: `add:${operation.id}`,
      payload: operation,
      pending: this.addPending,
      batcher: this.addBatcher,
    });
  }

  public enqueueReadWrite(
    operation: ReadWriteOperation,
  ): Promise<ReadWriteResult> {
    return this.enqueue({
      key: this.readWriteKey(operation),
      payload: operation,
      pending: this.readWritePending,
      batcher: this.readWriteBatcher,
    });
  }

  public async shutdown(): Promise<void> {
    await this.flushAddBatch([...this.addPending.keys()]);
    await this.flushReadWriteBatch([...this.readWritePending.keys()]);
  }

  private enqueue<TPayload, TResult>(params: {
    key: string;
    payload: TPayload;
    pending: Map<string, PendingOperation<TPayload, TResult>>;
    batcher: Bottleneck.Batcher;
  }): Promise<TResult> {
    const current = params.pending.get(params.key);

    if (current) {
      return new Promise<TResult>((resolve, reject) => {
        current.resolvers.push(resolve);
        current.rejecters.push(reject);
      });
    }

    return new Promise<TResult>((resolve, reject) => {
      params.pending.set(params.key, {
        payload: params.payload,
        resolvers: [resolve],
        rejecters: [reject],
      });

      params.batcher.add(params.key).catch((error: unknown) => {
        this.rejectPendingByKey(params.pending, params.key, error);
      });
    });
  }

  private async flushAddBatch(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      for (const key of keys) {
        const pending = this.addPending.get(key);

        if (!pending) {
          continue;
        }

        const result = this.itemsRepository.addId(pending.payload.id);
        pending.resolvers.forEach((resolve) => resolve(result));
        this.addPending.delete(key);
      }
    } catch (error) {
      for (const key of keys) {
        this.rejectPendingByKey(this.addPending, key, error);
      }
    }
  }

  private async flushReadWriteBatch(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      for (const key of keys) {
        const pending = this.readWritePending.get(key);

        if (!pending) {
          continue;
        }

        const result = this.executeReadWrite(pending.payload);
        pending.resolvers.forEach((resolve) => resolve(result));
        this.readWritePending.delete(key);
      }
    } catch (error) {
      for (const key of keys) {
        this.rejectPendingByKey(this.readWritePending, key, error);
      }
    }
  }

  private executeReadWrite(operation: ReadWriteOperation): ReadWriteResult {
    switch (operation.type) {
      case 'get-available': {
        const page = this.itemsRepository.getAvailablePage(operation.query);

        return {
          type: 'list',
          items: page.items,
          hasMore: page.hasMore,
        };
      }

      case 'get-selected': {
        const page = this.itemsRepository.getSelectedPage(operation.query);

        return {
          type: 'list',
          items: page.items,
          hasMore: page.hasMore,
        };
      }

      case 'select': {
        const result = this.itemsRepository.select(operation.id);

        return {
          type: 'mutation',
          changed: result.changed,
        };
      }

      case 'unselect': {
        const result = this.itemsRepository.unselect(operation.id);

        return {
          type: 'mutation',
          changed: result.changed,
        };
      }

      case 'reorder-visible': {
        const result = this.itemsRepository.reorderVisible(
          operation.visibleOrderedIds,
        );

        return {
          type: 'mutation',
          changed: result.changed,
        };
      }

      default:
        return {
          type: 'mutation',
          changed: false,
        };
    }
  }

  private readWriteKey(operation: ReadWriteOperation): string {
    switch (operation.type) {
      case 'get-available':
      case 'get-selected':
        return `${operation.type}:${operation.query.filter}:${operation.query.offset}:${operation.query.limit}`;
      case 'select':
      case 'unselect':
        return `${operation.type}:${operation.id}`;
      case 'reorder-visible':
        return `${operation.type}:${operation.visibleOrderedIds.join(',')}`;
      default:
        return 'unknown';
    }
  }

  private rejectPendingByKey<TPayload, TResult>(
    pendingMap: Map<string, PendingOperation<TPayload, TResult>>,
    key: string,
    error: unknown,
  ): void {
    const pending = pendingMap.get(key);

    if (!pending) {
      return;
    }

    pending.rejecters.forEach((reject) => reject(error));
    pendingMap.delete(key);
  }
}
