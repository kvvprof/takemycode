import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useDebounce } from 'use-debounce';
import { SortableItemRow } from '@/components/items/sortable-item-row';
import { useItemsInfiniteList } from '@/hooks/use-items-infinite-list';

type SelectedItemsPanelProps = {
  filter: string;
  onFilterChange: (value: string) => void;
  reorderMutation: {
    mutateAsync: (input: { visibleOrderedIds: number[] }) => Promise<{
      changed: boolean;
    }>;
  };
  unselectMutation: {
    mutateAsync: (input: { id: number }) => Promise<{ changed: boolean }>;
  };
  unselectBusy: boolean;
  reorderBusy: boolean;
  listBusy: boolean;
};

export const SelectedItemsPanel = ({
  filter,
  onFilterChange,
  reorderMutation,
  unselectMutation,
  unselectBusy,
  reorderBusy,
  listBusy,
}: SelectedItemsPanelProps) => {
  const [debouncedFilter] = useDebounce(filter, 300);
  const list = useItemsInfiniteList('selected', debouncedFilter);
  const isListBlocked = listBusy || list.isLoading || list.isRefreshing;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const sortableIds = useMemo(
    () => list.items.map((item) => item.id),
    [list.items],
  );

  const handleLoadMore = useCallback(() => {
    if (!list.hasMore || list.isFetchingNextPage) {
      return;
    }

    void list.fetchNext();
  }, [list]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (reorderBusy || isListBlocked) {
        return;
      }

      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = sortableIds.indexOf(active.id as number);
      const newIndex = sortableIds.indexOf(over.id as number);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const nextOrder = arrayMove(sortableIds, oldIndex, newIndex);

      void reorderMutation
        .mutateAsync({
          visibleOrderedIds: nextOrder,
        })
        .catch(() => undefined);
    },
    [isListBlocked, reorderBusy, reorderMutation, sortableIds],
  );

  const handleUnselect = (id: number): Promise<void> => {
    return unselectMutation
      .mutateAsync({ id })
      .then(() => undefined)
      .catch(() => undefined);
  };

  return (
    <article className='items-panel items-panel--selected'>
      <div className='items-panel__header'>
        <h2 className='items-panel__title'>Правое окно</h2>
        <span className='items-panel__subtitle'>Выбранные элементы</span>
      </div>

      <label className='items-panel__field'>
        <span className='items-panel__field-label'>Поиск по ID</span>
        <input
          className='items-panel__input'
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder='Например 100'
          value={filter}
        />
      </label>

      <div aria-hidden className='items-panel__add-form-spacer' />

      <div className='items-panel__table-wrap'>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            void handleDragEnd(event);
          }}
          sensors={sensors}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className='items-panel__list-head'>
              <div className='items-panel__list-head-cell'>
                ID (Drag & Drop)
              </div>
              <div className='items-panel__list-head-cell items-panel__list-head-cell--action' />
            </div>

            {list.items.length > 0 ? (
              <div className='items-panel__list-host'>
                <Virtuoso
                  className='items-panel__list'
                  style={{ height: '100%' }}
                  data={list.items}
                  endReached={handleLoadMore}
                  itemContent={(_, item) => (
                    <SortableItemRow
                      listBlocked={isListBlocked}
                      unselectBusy={unselectBusy}
                      id={item.id}
                      onUnselect={handleUnselect}
                    />
                  )}
                />
              </div>
            ) : null}
          </SortableContext>
        </DndContext>

        {!list.isLoading && list.items.length === 0 ? (
          <div className='items-panel__status items-panel__status--empty'>
            Нет выбранных элементов
          </div>
        ) : null}

        {list.error ? (
          <div className='items-panel__status items-panel__status--error'>
            Не удалось загрузить список: {list.errorMessage}
          </div>
        ) : null}

        {list.isFetchingNextPage ? (
          <div className='items-panel__status items-panel__status--loading'>
            Загрузка...
          </div>
        ) : null}

        {isListBlocked ? (
          <div className='items-panel__blocker'>Обновление...</div>
        ) : null}
      </div>
    </article>
  );
};
