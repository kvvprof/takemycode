import { PAGE_SIZE } from '@packages/contract';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpc } from '@/configs/orpc';
import { showRequestErrorToast } from '@/utils/show-request-error-toast';

type ListKind = 'available' | 'selected';

export const useItemsInfiniteList = (kind: ListKind, filter: string) => {
  const procedure =
    kind === 'available'
      ? orpc.api.items.getAvailable
      : orpc.api.items.getSelected;

  const query = useInfiniteQuery(
    procedure.infiniteOptions({
      queryKey: ['items', kind, filter],
      initialPageParam: 0,
      input: (pageParam: number) => ({
        filter,
        offset: pageParam,
        limit: PAGE_SIZE,
      }),
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasMore) {
          return undefined;
        }

        return allPages.reduce((sum, page) => sum + page.items.length, 0);
      },
      onError: showRequestErrorToast,
    }),
  );

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );
  const errorMessage = useMemo(() => {
    if (!query.error) {
      return null;
    }

    if (query.error instanceof Error) {
      return query.error.message;
    }

    return 'Ошибка загрузки списка';
  }, [query.error]);

  return {
    items,
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing: query.isRefetching,
    isLoading: query.isLoading,
    error: query.error,
    errorMessage,
    fetchNext: query.fetchNextPage,
  };
};
