import { z } from 'zod';

export const ApiErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  errorKey: z.string(),
  path: z.string(),
  timestamp: z.string(),
  issues: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
