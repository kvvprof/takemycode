import { HTTP_STATUS_CODES } from '@/constants/http-status-codes.constant';

const ERROR_DEFINITIONS = {
  BAD_REQUEST: {
    message: 'Bad request',
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
  },
  VALIDATION_ERROR: {
    message: 'Validation error',
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    message: 'Unauthorized',
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
  },
  FORBIDDEN: {
    message: 'Forbidden',
    statusCode: HTTP_STATUS_CODES.FORBIDDEN,
  },
  NOT_FOUND: {
    message: 'Not found',
    statusCode: HTTP_STATUS_CODES.NOT_FOUND,
  },
  CONFLICT: {
    message: 'Conflict',
    statusCode: HTTP_STATUS_CODES.CONFLICT,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
    statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  },
} as const;

export const ERRORS = ERROR_DEFINITIONS;

export type ErrorDefinition = (typeof ERRORS)[keyof typeof ERRORS];
export type ErrorCode = keyof typeof ERRORS & string;
