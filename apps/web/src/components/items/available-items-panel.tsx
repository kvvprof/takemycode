import { toast } from 'react-toastify';
import { Virtuoso } from 'react-virtuoso';
import { useDebounce } from 'use-debounce';
import { useItemsInfiniteList } from '@/hooks/use-items-infinite-list';

type AvailableItemsPanelProps = {
  filter: string;
  onFilterChange: (value: string) => void;
  newId: string;
  onNewIdChange: (value: string) => void;
  addMutation: {
    mutateAsync: (input: { id: number }) => Promise<{ added: boolean }>;
  };
  onSelectMutation: {
    mutateAsync: (input: { id: number }) => Promise<{ changed: boolean }>;
  };
  addBusy: boolean;
  selectBusy: boolean;
  listBusy: boolean;
};

export const AvailableItemsPanel = ({
  filter,
  onFilterChange,
  newId,
  onNewIdChange,
  addMutation,
  onSelectMutation,
  addBusy,
  selectBusy,
  listBusy,
}: AvailableItemsPanelProps) => {
  const [debouncedFilter] = useDebounce(filter, 300);
  const list = useItemsInfiniteList('available', debouncedFilter);
  const isListBlocked =
    listBusy || list.isLoading || list.isRefreshing || list.isFetchingNextPage;

  const handleAdd = async (): Promise<void> => {
    const id = Number(newId.trim());

    if (!Number.isSafeInteger(id)) {
      toast.error('Введите корректный целый ID');
      return;
    }

    toast.info(`Добавление ID ${id} поставлено в очередь (до 10 секунд)`);
    const result = await addMutation
      .mutateAsync({
        id,
      })
      .catch(() => null);

    if (!result) {
      return;
    }

    if (result.added) {
      toast.success(`ID ${id} добавлен`);
    } else {
      toast.warning(`ID ${id} уже существует`);
    }

    onNewIdChange('');
  };

  const handleSelect = (id: number): void => {
    void onSelectMutation.mutateAsync({ id }).catch(() => undefined);
  };

  const handleLoadMore = (): void => {
    if (!list.hasMore || list.isFetchingNextPage) {
      return;
    }

    void list.fetchNext();
  };

  return (
    <article className='items-panel items-panel--available'>
      <div className='items-panel__header'>
        <h2 className='items-panel__title'>Левое окно</h2>
        <span className='items-panel__subtitle'>Все, кроме выбранных</span>
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

      <div className='items-panel__add-form'>
        <input
          className='items-panel__input items-panel__input--add'
          onChange={(event) => onNewIdChange(event.target.value)}
          placeholder='Новый ID'
          value={newId}
        />
        <button
          className='items-panel__button items-panel__button--add'
          disabled={addBusy}
          onClick={() => void handleAdd()}
          type='button'
        >
          Добавить
        </button>
      </div>

      <div className='items-panel__table-wrap'>
        <div className='items-panel__list-head'>
          <div className='items-panel__list-head-cell'>ID</div>
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
                <div className='items-panel__item'>
                  <div className='items-panel__item-id'>{item.id}</div>
                  <div className='items-panel__item-action'>
                    <button
                      className='items-panel__button items-panel__button--select'
                      disabled={selectBusy || isListBlocked}
                      onClick={() => void handleSelect(item.id)}
                      type='button'
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        ) : null}

        {!list.isLoading && list.items.length === 0 ? (
          <div className='items-panel__status items-panel__status--empty'>
            Нет элементов
          </div>
        ) : null}

        {list.error ? (
          <div className='items-panel__status items-panel__status--error'>
            Не удалось загрузить список: {list.errorMessage}
          </div>
        ) : null}

        {isListBlocked ? (
          <div className='items-panel__blocker'>Обновление...</div>
        ) : null}
      </div>
    </article>
  );
};
