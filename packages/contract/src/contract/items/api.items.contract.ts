import { oc } from '@orpc/contract';
import { BASE_PATHS } from '@/constants/base-paths.constant';
import { HTTP_METHODS } from '@/constants/http-methods.constant';
import {
  AddResponseSchema,
  ItemSchema,
  ListQuerySchema,
  ListResponseSchema,
  MutationResponseSchema,
  ReorderSchema,
} from '@/schemas/items.schema';

export const ApiItemsContract = {
  getAvailable: oc
    .route({
      method: HTTP_METHODS.GET,
      path: `${BASE_PATHS.api}/items/available`,
    })
    .input(ListQuerySchema)
    .output(ListResponseSchema),

  getSelected: oc
    .route({
      method: HTTP_METHODS.GET,
      path: `${BASE_PATHS.api}/items/selected`,
    })
    .input(ListQuerySchema)
    .output(ListResponseSchema),

  add: oc
    .route({
      method: HTTP_METHODS.POST,
      path: `${BASE_PATHS.api}/items/add`,
    })
    .input(ItemSchema)
    .output(AddResponseSchema),

  select: oc
    .route({
      method: HTTP_METHODS.POST,
      path: `${BASE_PATHS.api}/items/select`,
    })
    .input(ItemSchema)
    .output(MutationResponseSchema),

  unselect: oc
    .route({
      method: HTTP_METHODS.POST,
      path: `${BASE_PATHS.api}/items/unselect`,
    })
    .input(ItemSchema)
    .output(MutationResponseSchema),

  reorderVisible: oc
    .route({
      method: HTTP_METHODS.POST,
      path: `${BASE_PATHS.api}/items/reorder-visible`,
    })
    .input(ReorderSchema)
    .output(MutationResponseSchema),
};
