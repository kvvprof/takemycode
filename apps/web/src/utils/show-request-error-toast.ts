import { toast } from 'react-toastify';

const FALLBACK_ERROR_MESSAGE = 'Ошибка выполнения операции';

export const getRequestErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return FALLBACK_ERROR_MESSAGE;
};

export const showRequestErrorToast = (error: unknown): void => {
  toast.error(getRequestErrorMessage(error));
};
