import type {
  AddOperation,
  AddResult,
  ReadWriteOperation,
  ReadWriteResult,
} from '@/modules/items/types/items-operation.type';

export interface IItemsQueueService {
  enqueueAdd(operation: AddOperation): Promise<AddResult>;
  enqueueReadWrite(operation: ReadWriteOperation): Promise<ReadWriteResult>;
  shutdown(): Promise<void>;
}
