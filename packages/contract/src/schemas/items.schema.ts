import { z } from 'zod';

export const MAX_DEFAULT_ID = 1_000_000;
export const PAGE_SIZE = 20;

export const ListQuerySchema = z.object({
  filter: z.string().trim().optional().default(''),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(PAGE_SIZE).default(PAGE_SIZE),
});

export const ItemSchema = z.object({
  id: z.number().int(),
});

export const ReorderSchema = z.object({
  visibleOrderedIds: z.array(z.number().int()).min(1),
});

export const ListResponseSchema = z.object({
  items: z.array(ItemSchema),
  hasMore: z.boolean(),
});

export const AddResponseSchema = z.object({
  added: z.boolean(),
});

export const MutationResponseSchema = z.object({
  changed: z.boolean(),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;
export type ItemDto = z.infer<typeof ItemSchema>;
export type ReorderPayload = z.infer<typeof ReorderSchema>;
export type ListResponse = z.infer<typeof ListResponseSchema>;
export type AddResponse = z.infer<typeof AddResponseSchema>;
export type MutationResponse = z.infer<typeof MutationResponseSchema>;
