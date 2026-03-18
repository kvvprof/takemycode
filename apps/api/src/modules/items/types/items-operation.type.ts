import type {
  AddResponse,
  ListQuery,
  MutationResponse,
} from '@packages/contract';

export type ReadWriteOperation =
  | {
      type: 'get-available';
      query: ListQuery;
    }
  | {
      type: 'get-selected';
      query: ListQuery;
    }
  | {
      type: 'select';
      id: number;
    }
  | {
      type: 'unselect';
      id: number;
    }
  | {
      type: 'reorder-visible';
      visibleOrderedIds: number[];
    };

export type AddOperation = {
  id: number;
};

export type ReadWriteResult =
  | {
      type: 'list';
      items: Array<{ id: number }>;
      hasMore: boolean;
    }
  | {
      type: 'mutation';
      changed: MutationResponse['changed'];
    };

export type AddResult = AddResponse;
