import { ORPCError } from '@orpc/client';
import { ApiErrorSchema } from '@packages/contract';

export const decodeApiError = (
  body: unknown,
): ORPCError<string, unknown> | null => {
  const parsed = ApiErrorSchema.safeParse(body);

  if (!parsed.success) {
    return null;
  }

  const { errorKey, statusCode, message, issues } = parsed.data;

  return new ORPCError(errorKey, {
    status: statusCode,
    message,
    data: issues,
  });
};
