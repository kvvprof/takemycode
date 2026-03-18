import type { ListQuery } from '@packages/contract';

export type PageResult = {
  items: Array<{ id: number }>;
  hasMore: boolean;
};

export interface IItemsRepository {
  addId(id: number): { added: boolean };
  select(id: number): { changed: boolean };
  unselect(id: number): { changed: boolean };
  reorderVisible(visibleOrderedIds: number[]): { changed: boolean };
  getSelectedPage(query: ListQuery): PageResult;
  getAvailablePage(query: ListQuery): PageResult;
}
