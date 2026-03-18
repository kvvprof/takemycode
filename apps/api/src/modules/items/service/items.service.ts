import {
  AddResponse,
  ItemDto,
  ListQuery,
  ListResponse,
  MutationResponse,
  ReorderPayload,
} from '@packages/contract';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/common';
import { IItemsQueueService } from '@/modules/items/queue/items-queue.service.interface';
import { IItemsService } from '@/modules/items/service/items.service.interface';

@injectable()
export class ItemsService implements IItemsService {
  constructor(
    @inject(TYPES.ItemsQueueService)
    private readonly itemsQueueService: IItemsQueueService,
  ) {}

  public async getAvailable(query: ListQuery): Promise<ListResponse> {
    const result = await this.itemsQueueService.enqueueReadWrite({
      type: 'get-available',
      query,
    });

    if (result.type !== 'list') {
      return {
        items: [],
        hasMore: false,
      };
    }

    return {
      items: result.items,
      hasMore: result.hasMore,
    };
  }

  public async getSelected(query: ListQuery): Promise<ListResponse> {
    const result = await this.itemsQueueService.enqueueReadWrite({
      type: 'get-selected',
      query,
    });

    if (result.type !== 'list') {
      return {
        items: [],
        hasMore: false,
      };
    }

    return {
      items: result.items,
      hasMore: result.hasMore,
    };
  }

  public async add(input: ItemDto): Promise<AddResponse> {
    return this.itemsQueueService.enqueueAdd({
      id: input.id,
    });
  }

  public async select(input: ItemDto): Promise<MutationResponse> {
    const result = await this.itemsQueueService.enqueueReadWrite({
      type: 'select',
      id: input.id,
    });

    return {
      changed: result.type === 'mutation' ? result.changed : false,
    };
  }

  public async unselect(input: ItemDto): Promise<MutationResponse> {
    const result = await this.itemsQueueService.enqueueReadWrite({
      type: 'unselect',
      id: input.id,
    });

    return {
      changed: result.type === 'mutation' ? result.changed : false,
    };
  }

  public async reorderVisible(
    input: ReorderPayload,
  ): Promise<MutationResponse> {
    const result = await this.itemsQueueService.enqueueReadWrite({
      type: 'reorder-visible',
      visibleOrderedIds: input.visibleOrderedIds,
    });

    return {
      changed: result.type === 'mutation' ? result.changed : false,
    };
  }

  public async shutdown(): Promise<void> {
    await this.itemsQueueService.shutdown();
  }
}
