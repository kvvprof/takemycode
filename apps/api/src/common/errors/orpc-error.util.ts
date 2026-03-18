import { ORPCError } from '@orpc/server';
import { ApiError, ERRORS, type ErrorCode } from '@packages/contract';

const INTERNAL_ERROR_CODE: ErrorCode = 'INTERNAL_SERVER_ERROR';

const resolveErrorCode = (code: string): ErrorCode => {
  if (code in ERRORS) {
    return code as ErrorCode;
  }

  return INTERNAL_ERROR_CODE;
};

export const toORPCError = (
  code: ErrorCode,
  issues?: unknown,
): ORPCError<ErrorCode, unknown> => {
  const definition = ERRORS[code];

  return new ORPCError(code, {
    status: definition.statusCode,
    message: definition.message,
    data: issues,
  });
};

export const toApiErrorBody = (error: ORPCError<any, any>): ApiError => {
  const resolvedCode = resolveErrorCode(error.code);
  const definition = ERRORS[resolvedCode];

  const body: ApiError = {
    message: error.message || definition.message,
    statusCode: error.status || definition.statusCode,
    errorKey: resolvedCode,
    path: '',
    timestamp: new Date().toISOString(),
  };

  if (error.data !== undefined) {
    body.issues = error.data;
  }

  return body;
};
