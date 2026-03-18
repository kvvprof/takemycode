import { ApiItemsContract } from '@/contract/items/api.items.contract';

export const Contract = {
  api: {
    items: ApiItemsContract,
  },
};

export type Contract = typeof Contract;
