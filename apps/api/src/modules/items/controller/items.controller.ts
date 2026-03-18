import { AnyRouter, implement } from '@orpc/server';
import { Contract } from '@packages/contract';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/common';
import { IItemsController } from '@/modules/items/controller/items.controller.interface';
import { IItemsService } from '@/modules/items/service/items.service.interface';

@injectable()
export class ItemsController implements IItemsController {
  public readonly router: AnyRouter;

  constructor(
    @inject(TYPES.ItemsService)
    private readonly itemsService: IItemsService,
  ) {
    const contractImplementer = implement(Contract);

    this.router = contractImplementer.router({
      api: {
        items: {
          getAvailable: contractImplementer.api.items.getAvailable.handler(
            async ({ input }) => this.itemsService.getAvailable(input),
          ),
          getSelected: contractImplementer.api.items.getSelected.handler(
            async ({ input }) => this.itemsService.getSelected(input),
          ),
          add: contractImplementer.api.items.add.handler(async ({ input }) =>
            this.itemsService.add(input),
          ),
          select: contractImplementer.api.items.select.handler(
            async ({ input }) => this.itemsService.select(input),
          ),
          unselect: contractImplementer.api.items.unselect.handler(
            async ({ input }) => this.itemsService.unselect(input),
          ),
          reorderVisible: contractImplementer.api.items.reorderVisible.handler(
            async ({ input }) => this.itemsService.reorderVisible(input),
          ),
        },
      },
    });
  }
}
