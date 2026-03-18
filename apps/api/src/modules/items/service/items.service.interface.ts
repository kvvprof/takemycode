import type {
  AddResponse,
  ItemDto,
  ListQuery,
  ListResponse,
  MutationResponse,
  ReorderPayload,
} from '@packages/contract';

export interface IItemsService {
  getAvailable(query: ListQuery): Promise<ListResponse>;
  getSelected(query: ListQuery): Promise<ListResponse>;
  add(input: ItemDto): Promise<AddResponse>;
  select(input: ItemDto): Promise<MutationResponse>;
  unselect(input: ItemDto): Promise<MutationResponse>;
  reorderVisible(input: ReorderPayload): Promise<MutationResponse>;
  shutdown(): Promise<void>;
}
