import { ListQuery, MAX_DEFAULT_ID } from '@packages/contract';
import { injectable } from 'inversify';
import {
  IItemsRepository,
  PageResult,
} from '@/modules/items/repository/items.repository.interface';

@injectable()
export class ItemsRepository implements IItemsRepository {
  private readonly selectedOrder: number[] = [];
  private readonly selectedSet = new Set<number>();
  private readonly customIds = new Set<number>();

  public addId(id: number): { added: boolean } {
    if (!Number.isSafeInteger(id)) {
      return { added: false };
    }

    if (this.isDefaultId(id)) {
      return { added: false };
    }

    if (this.customIds.has(id)) {
      return { added: false };
    }

    this.customIds.add(id);
    return { added: true };
  }

  public select(id: number): { changed: boolean } {
    if (!this.hasId(id) || this.selectedSet.has(id)) {
      return { changed: false };
    }

    this.selectedSet.add(id);
    this.selectedOrder.push(id);

    return { changed: true };
  }

  public unselect(id: number): { changed: boolean } {
    if (!this.selectedSet.has(id)) {
      return { changed: false };
    }

    this.selectedSet.delete(id);

    const index = this.selectedOrder.indexOf(id);
    if (index !== -1) {
      this.selectedOrder.splice(index, 1);
    }

    return { changed: true };
  }

  public reorderVisible(visibleOrderedIds: number[]): { changed: boolean } {
    if (visibleOrderedIds.length < 2) {
      return { changed: false };
    }

    const unique = new Set(visibleOrderedIds);

    if (unique.size !== visibleOrderedIds.length) {
      return { changed: false };
    }

    for (const id of visibleOrderedIds) {
      if (!this.selectedSet.has(id)) {
        return { changed: false };
      }
    }

    const visibleSet = new Set(visibleOrderedIds);
    const nextVisible = [...visibleOrderedIds];
    let changed = false;

    for (let index = 0; index < this.selectedOrder.length; index += 1) {
      const current = this.selectedOrder[index];

      if (!visibleSet.has(current)) {
        continue;
      }

      const next = nextVisible.shift();

      if (next === undefined) {
        return { changed: false };
      }

      if (next !== current) {
        changed = true;
      }

      this.selectedOrder[index] = next;
    }

    return { changed };
  }

  public getSelectedPage(query: ListQuery): PageResult {
    const normalizedFilter = query.filter.trim();

    const filtered =
      normalizedFilter.length === 0
        ? this.selectedOrder
        : this.selectedOrder.filter((id) =>
            this.matchesFilter(id, normalizedFilter),
          );

    const items = filtered
      .slice(query.offset, query.offset + query.limit)
      .map((id) => ({ id }));

    return {
      items,
      hasMore: query.offset + items.length < filtered.length,
    };
  }

  public getAvailablePage(query: ListQuery): PageResult {
    const normalizedFilter = query.filter.trim();
    const customSorted = [...this.customIds].sort((a, b) => a - b);

    const items: Array<{ id: number }> = [];
    let matchedCount = 0;

    let baseValue = 1;
    let customIndex = 0;

    while (true) {
      const nextBase = baseValue <= MAX_DEFAULT_ID ? baseValue : null;
      const nextCustom =
        customIndex < customSorted.length ? customSorted[customIndex] : null;
      let next: number | null = null;

      if (nextBase === null && nextCustom === null) {
        break;
      }

      if (
        nextBase !== null &&
        (nextCustom === null || nextBase <= nextCustom)
      ) {
        next = nextBase;
        baseValue += 1;

        if (nextCustom !== null && nextCustom === nextBase) {
          customIndex += 1;
        }
      } else if (nextCustom !== null) {
        next = nextCustom;
        customIndex += 1;
      }

      if (next === null) {
        break;
      }

      if (this.selectedSet.has(next)) {
        continue;
      }

      if (!this.matchesFilter(next, normalizedFilter)) {
        continue;
      }

      if (matchedCount < query.offset) {
        matchedCount += 1;
        continue;
      }

      if (items.length < query.limit) {
        items.push({ id: next });
        matchedCount += 1;
        continue;
      }

      return {
        items,
        hasMore: true,
      };
    }

    return {
      items,
      hasMore: false,
    };
  }

  private hasId(id: number): boolean {
    return this.isDefaultId(id) || this.customIds.has(id);
  }

  private isDefaultId(id: number): boolean {
    return Number.isInteger(id) && id >= 1 && id <= MAX_DEFAULT_ID;
  }

  private matchesFilter(id: number, filter: string): boolean {
    if (filter.length === 0) {
      return true;
    }

    return id.toString().includes(filter);
  }
}
