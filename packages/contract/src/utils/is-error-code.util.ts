import type { ErrorCode } from '@/constants/errors.constant';

export const isErrorCode = <T extends ErrorCode>(
  error: unknown,
  code: T,
): error is { code: T } => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return (error as { code?: unknown }).code === code;
};
