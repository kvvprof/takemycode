import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ListResponse } from '@packages/contract';
import type { InfiniteData } from '@tanstack/react-query';
import { AvailableItemsPanel } from '@/components/items/available-items-panel';
import { SelectedItemsPanel } from '@/components/items/selected-items-panel';
import { orpc } from '@/configs/orpc';
import { showRequestErrorToast } from '@/utils/show-request-error-toast';

export const App = () => {
  const [leftFilter, setLeftFilter] = useState('');
  const [rightFilter, setRightFilter] = useState('');
  const [newIdValue, setNewIdValue] = useState('');
  const queryClient = useQueryClient();

  const keepOnlyFirstPage = (
    data: InfiniteData<ListResponse, number> | undefined,
  ) => {
    if (!data || data.pages.length <= 1) {
      return data;
    }

    return {
      pages: [data.pages[0]],
      pageParams: [data.pageParams[0]],
    } satisfies InfiniteData<ListResponse, number>;
  };

  const resetAvailablePages = () => {
    queryClient.setQueriesData<InfiniteData<ListResponse, number> | undefined>(
      { queryKey: ['items', 'available'] },
      keepOnlyFirstPage,
    );
  };

  const resetSelectedPages = () => {
    queryClient.setQueriesData<InfiniteData<ListResponse, number> | undefined>(
      { queryKey: ['items', 'selected'] },
      keepOnlyFirstPage,
    );
  };

  const invalidateAvailableList = async () => {
    resetAvailablePages();

    await queryClient.invalidateQueries({
      queryKey: ['items', 'available'],
      refetchType: 'active',
    });
  };

  const invalidateSelectedList = async () => {
    resetSelectedPages();

    await queryClient.invalidateQueries({
      queryKey: ['items', 'selected'],
      refetchType: 'active',
    });
  };

  const invalidateBothLists = async () => {
    resetAvailablePages();
    resetSelectedPages();

    await queryClient.invalidateQueries({
      queryKey: ['items', 'available'],
      refetchType: 'active',
    });

    await queryClient.invalidateQueries({
      queryKey: ['items', 'selected'],
      refetchType: 'active',
    });
  };

  const addMutation = useMutation(
    orpc.api.items.add.mutationOptions({
      onSuccess: async (result) => {
        if (!result.added) {
          return;
        }

        await invalidateAvailableList();
      },
      onError: showRequestErrorToast,
    }),
  );

  const selectMutation = useMutation(
    orpc.api.items.select.mutationOptions({
      onSuccess: async (result) => {
        if (!result.changed) {
          return;
        }

        await invalidateBothLists();
      },
      onError: showRequestErrorToast,
    }),
  );

  const unselectMutation = useMutation(
    orpc.api.items.unselect.mutationOptions({
      onSuccess: async (result) => {
        if (!result.changed) {
          return;
        }

        await invalidateBothLists();
      },
      onError: showRequestErrorToast,
    }),
  );

  const reorderMutation = useMutation(
    orpc.api.items.reorderVisible.mutationOptions({
      onSuccess: async (result) => {
        if (!result.changed) {
          return;
        }

        await invalidateSelectedList();
      },
      onError: showRequestErrorToast,
    }),
  );

  const isAddPending = addMutation.isPending;
  const isSelectPending = selectMutation.isPending;
  const isUnselectPending = unselectMutation.isPending;
  const isReorderPending = reorderMutation.isPending;

  return (
    <main className='app'>
      <header className='app__header'>
        <h1 className='app__title'>takemycode</h1>
        <p className='app__subtitle'>Тестовое задание на позицию fullstack</p>
      </header>

      <section className='app__grid'>
        <AvailableItemsPanel
          addBusy={isAddPending}
          listBusy={isAddPending || isSelectPending || isUnselectPending}
          selectBusy={isSelectPending}
          addMutation={addMutation}
          filter={leftFilter}
          newId={newIdValue}
          onFilterChange={setLeftFilter}
          onSelectMutation={selectMutation}
          onNewIdChange={setNewIdValue}
        />

        <SelectedItemsPanel
          listBusy={isReorderPending || isSelectPending || isUnselectPending}
          reorderBusy={isReorderPending}
          reorderMutation={reorderMutation}
          unselectBusy={isUnselectPending}
          unselectMutation={unselectMutation}
          filter={rightFilter}
          onFilterChange={setRightFilter}
        />
      </section>
    </main>
  );
};
